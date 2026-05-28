# Engines - Cleanly

Esta pasta contém a camada de engines de processamento do Cleanly.

## Estado Atual (Módulo 1 - Watermark Removal)

O projeto está focado **100% em remoção de marca d'água** usando **LaMa via IOPaint**.

- `base.py` — Interface abstrata
- `engine_factory.py` — Factory simples (só "lama")
- `lama_engine.py` — Implementação funcional usando LaMa (o mais leve e rápido para watermark)

## Como funciona

1. O usuário desenha a máscara no frontend.
2. O backend salva a imagem + máscara.
3. A task do Celery chama o `LamaEngine`.
4. O engine executa o comando `iopaint run --model lama` dentro do container dedicado.
5. O resultado volta para o usuário.

## Por que só LaMa?

- Leve (roda bem em CPU)
- Excelente qualidade para remoção de marcas d'água e texto
- Não precisa de prompt
- Rápido de construir e executar

Outros engines (SD Inpaint, etc.) foram removidos para manter o projeto simples, leve e adequado como portfólio/estudo.

## Como adicionar um novo Engine (futuro)

Se quiser experimentar outros modelos depois:

1. Crie `novo_engine.py` herdando de `BaseEngine`
2. Implemente `process()`
3. Registre no `engine_factory.py`

## Comandos úteis

```bash
# Ver logs do processamento
docker compose logs -f celery-worker

# Acessar o container do IOPaint
docker exec -it cleanly-iopaint bash
```

## Stack usada

- LaMa (via IOPaint)
- FastAPI + Celery + PostgreSQL + Redis
- Next.js (frontend)
- Docker Compose
