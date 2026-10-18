.PHONY: setup dev test lint seed eval build

setup:
	python -m pip install -e "./apps/api[dev]"

dev:
	uvicorn app.main:app --app-dir apps/api --reload --port 8000

test:
	pytest tests

lint:
	ruff check apps/api tests && mypy apps/api/app/engines

seed:
	python -c "import sys; sys.path.insert(0, './apps/api'); from app.seed import run_seed; run_seed()"

eval:
	python -m eval.runner

build:
	docker compose build
