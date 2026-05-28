# Cleanly - Watermark Removal

**Remoção de Marca d'Água com IA Local (LaMa)**

Cleanly é uma aplicação web simples e elegante para remover marcas d'água, logos e textos de imagens usando **LaMa** (via IOPaint), tudo rodando localmente no seu computador.

Projeto criado para portfólio e estudo, com código limpo, arquitetura clara e foco total no Módulo 1 (Watermark Removal).

## Funcionalidades Atuais

- Upload de imagem
- Editor de máscara com pincel e borracha (preciso)
- Processamento assíncrono com Celery + LaMa
- Galeria de resultados com thumbnails
- Autenticação simples (login/registro)
- 100% local (sem envio para nuvem)

## Stack

- **Backend**: FastAPI + SQLAlchemy + PostgreSQL + Celery + Redis
- **IA**: LaMa via IOPaint (leve e de alta qualidade para watermark)
- **Frontend**: Next.js + TypeScript + Tailwind
- **Infra**: Docker Compose

## Como Rodar

```bash
# 1. Suba tudo (primeira vez pode demorar um pouco baixando o modelo LaMa)
sudo docker compose up --build -d

# 2. Acesse
# Frontend:  http://localhost:3000
# Backend:   http://localhost:8000/docs
```

Depois de subir, registre uma conta e comece a remover marcas d'água.

## Por que só Watermark Removal?

Este projeto foi **deliberadamente simplificado** para ser:
- Leve e rápido de buildar
- Fácil de estudar e manter
- Um excelente exemplo de portfólio (arquitetura limpa, separação de concerns, engines plugáveis)

Outros modos (Object Removal e Restoration) foram removidos para manter o foco e a simplicidade.

## Estrutura do Projeto

```
cleanly/
├── docker-compose.yml
├── python/                 # Backend (FastAPI)
│   ├── app/
│   │   ├── engines/        # LaMa Engine (único engine ativo)
│   │   ├── routers/
│   │   ├── services/
│   │   └── tasks.py
│   └── requirements.txt
├── frontend/               # Next.js
└── Dockerfile.iopaint
```

## Desenvolvimento

- O engine LaMa roda dentro do container `cleanly-iopaint`
- O backend se comunica via volumes + subprocess (padrão simples e confiável)
- Todo processamento é assíncrono via Celery

## Objetivo

Este projeto serve como:
- Portfólio técnico (Fullstack + IA local)
- Estudo de arquitetura limpa com engines de IA
- Demonstração de pipeline completo (upload → máscara → fila → processamento → galeria)

## Licença

Estudo / Portfólio — use como referência.
