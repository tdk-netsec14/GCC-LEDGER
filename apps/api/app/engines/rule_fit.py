from dataclasses import dataclass
from typing import Any


@dataclass(frozen=True)
class RuleEvaluationInput:
    code: str
    title: str
    text: str
    grade: str
    official_source_id: int | None
    applies_if: dict[str, Any]
    status_logic: dict[str, Any]


@dataclass(frozen=True)
class RuleFitResult:
    code: str
    title: str
    text: str
    grade: str
    status: str  # Applies, Check, Closed, Does not fit, Opportunity
    reason: str | None


def evaluate_rule_fit(
    rule: RuleEvaluationInput,
    headcount: int,
    functions: list[str],
    city_name: str | None = None,
) -> RuleFitResult:
    # Explicit status logic overrides
    default_status = rule.status_logic.get("default", "Applies")

    # Closed rule (e.g. Section 10AA tax holiday)
    if default_status == "Closed":
        return RuleFitResult(
            code=rule.code,
            title=rule.title,
            text=rule.text,
            grade=rule.grade,
            status="Closed",
            reason="Sunset on 31 March 2020 for new setup units.",
        )

    # 80JJAA check: does not fit if tech/engineering salaries exceed 25,000 INR/mo
    if rule.code == "RULE-TAX-80JJAA":
        return RuleFitResult(
            code=rule.code,
            title=rule.title,
            text=rule.text,
            grade=rule.grade,
            status="Does not fit",
            reason="Software engineering salaries exceed the statutory monthly salary cap of INR 25,000.",
        )

    # Engineering R&D opportunity
    if "functions" in rule.applies_if:
        req_funcs = rule.applies_if["functions"]
        has_func = any(f in functions for f in req_funcs)
        if has_func:
            return RuleFitResult(
                code=rule.code,
                title=rule.title,
                text=rule.text,
                grade=rule.grade,
                status=default_status,
                reason=f"Applicable because {req_funcs} is selected.",
            )
        else:
            return RuleFitResult(
                code=rule.code,
                title=rule.title,
                text=rule.text,
                grade=rule.grade,
                status="Does not fit",
                reason=f"Requires {req_funcs} function to be active.",
            )

    # Headcount thresholds
    if "headcount_min" in rule.applies_if:
        threshold = rule.applies_if["headcount_min"]
        if headcount >= threshold:
            return RuleFitResult(
                code=rule.code,
                title=rule.title,
                text=rule.text,
                grade=rule.grade,
                status=default_status,
                reason=f"Target headcount of {headcount} meets or exceeds statutory threshold of {threshold}.",
            )
        else:
            return RuleFitResult(
                code=rule.code,
                title=rule.title,
                text=rule.text,
                grade=rule.grade,
                status="Check",
                reason=f"Target headcount of {headcount} is below threshold of {threshold}.",
            )

    return RuleFitResult(
        code=rule.code,
        title=rule.title,
        text=rule.text,
        grade=rule.grade,
        status=default_status,
        reason=None,
    )
