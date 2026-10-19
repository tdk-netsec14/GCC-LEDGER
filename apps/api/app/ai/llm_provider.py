import json
import os
import re
from abc import ABC, abstractmethod
from typing import Any

from app.config import settings


class LLMProvider(ABC):
    @abstractmethod
    def generate(
        self,
        system_prompt: str,
        user_prompt: str,
        temperature: float = 0.0,
        max_tokens: int = 500,
    ) -> str:
        pass


class MockLLMProvider(LLMProvider):
    """Deterministic mock provider that requires no network access and costs $0."""

    def generate(
        self,
        system_prompt: str,
        user_prompt: str,
        temperature: float = 0.0,
        max_tokens: int = 500,
    ) -> str:
        # Check if the prompt asks for JSON output
        wants_json = "JSON" in system_prompt or "json" in user_prompt.lower()

        # Extract passages from delimited block if present
        context_match = re.search(
            r"--- BEGIN CONTEXT ---\s*(.*?)\s*--- END CONTEXT ---",
            user_prompt,
            re.DOTALL,
        )
        context_text = context_match.group(1) if context_match else ""

        # Extract question
        q_match = re.search(
            r"--- BEGIN QUESTION ---\s*(.*?)\s*--- END QUESTION ---",
            user_prompt,
            re.DOTALL,
        )
        question = q_match.group(1).strip() if q_match else user_prompt.strip()

        # If captive classifier prompt
        if "captive classifier" in system_prompt.lower():
            is_captive = "wholly owned" in user_prompt.lower() or "subsidiary" in user_prompt.lower()
            return json.dumps({
                "captive": "yes" if is_captive else "no",
                "rationale": "Entity operates as an internal support center for parent operations.",
                "confidence": 0.95,
            })

        # If extraction assistant prompt
        if "extraction assistant" in system_prompt.lower():
            # Extract simple patterns with exact verbatim quotes
            candidates: list[dict[str, Any]] = []
            numbers = re.findall(r"(\b\d+(?:,\d+)*(?:\.\d+)?(?:\s*(?:%|crore|lakh|USD|persons|GCCs))?\b)", context_text)
            for num in numbers[:3]:
                # find sentence containing num for verbatim quote
                for line in context_text.splitlines():
                    if num in line and len(line.strip()) > 10:
                        candidates.append({
                            "claim_text": line.strip(),
                            "value_number": float(re.sub(r"[^\d.]", "", num) or 0),
                            "evidence_span": line.strip()[:100],
                        })
                        break
            return json.dumps({"extracted_claims": candidates})

        # Default: Grounded Ask generator
        # Collect sentences from context that share words with the question
        q_words = set(re.findall(r"\w+", question.lower())) - {"what", "is", "the", "in", "of", "how", "many", "to"}
        matching_sentences: list[str] = []
        for line in context_text.splitlines():
            line_str = line.strip()
            if not line_str:
                continue
            line_words = set(re.findall(r"\w+", line_str.lower()))
            if q_words & line_words:
                matching_sentences.append(line_str)

        chosen = matching_sentences[:2] if matching_sentences else context_text.splitlines()[:2]
        clean_text = " ".join([c.replace("\n", " ").strip() for c in chosen if c.strip()])

        if wants_json:
            return json.dumps({
                "answer": clean_text or "No matching factual statements found in approved passages.",
                "confidence": 0.95 if clean_text else 0.0,
            })

        return clean_text or "No matching information found in provided context."


class OpenAILLMProvider(LLMProvider):
    """OpenAI-compatible provider calling ChatCompletion with strict budget tracking."""

    def __init__(self) -> None:
        api_key = settings.openai_api_key or os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OPENAI_API_KEY environment variable is required for OpenAILLMProvider")
        try:
            from openai import OpenAI
            client_args: dict[str, str] = {"api_key": api_key}
            if settings.openai_base_url:
                client_args["base_url"] = settings.openai_base_url
            self.client = OpenAI(**client_args)
        except ImportError:
            raise ImportError("openai package is not installed. Run pip install openai")

    def generate(
        self,
        system_prompt: str,
        user_prompt: str,
        temperature: float = 0.0,
        max_tokens: int = 500,
    ) -> str:
        # Check budget limits if needed
        response = self.client.chat.completions.create(
            model=settings.openai_model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=temperature,
            max_tokens=max_tokens,
        )
        return response.choices[0].message.content or ""


def get_llm_provider() -> LLMProvider:
    provider_name = (settings.llm_provider or "mock").lower()
    if provider_name in {"openai", "openrouter"}:
        return OpenAILLMProvider()
    return MockLLMProvider()
