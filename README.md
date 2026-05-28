# Cleanly

**Remoção Inteligente de Marca d'Água com IA Local**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/Python-3.12-blue)](https://www.python.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED)](https://www.docker.com/)

Cleanly é uma aplicação web moderna e leve para **remoção de marcas d'água, logos e textos** de imagens usando inteligência artificial local (LaMa via IOPaint).

> Projeto desenvolvido com foco em **qualidade de código**, simplicidade e como portfólio técnico / estudo.

---

## ✨ Funcionalidades

- Remoção de alta qualidade usando **LaMa** (excelente para marcas d'água e texto)
- Editor de máscara com pincel e borracha (preciso e intuitivo)
- Processamento assíncrono (fila com Celery)
- Galeria de resultados com thumbnails
- Autenticação JWT (login e registro)
- 100% local — nenhuma imagem sai do seu computador
- Arquitetura limpa e fácil de estudar

---

## 🛠️ Stack Tecnológica

| Camada       | Tecnologia                          |
|--------------|-------------------------------------|
| Backend      | FastAPI + SQLAlchemy + Celery       |
| IA           | LaMa (via IOPaint)                  |
| Banco        | PostgreSQL                          |
| Cache/Fila   | Redis                               |
| Frontend     | Next.js 15 + TypeScript + Tailwind  |
| Infra        | Docker Compose                      |

---

## 🚀 Como Rodar (Recomendado)

### 1. Clone o repositório

```bash
git clone https://github.com/ivamartins/python-cleanly-ai.git
cd python-cleanly-ai
```

### 2. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env` e coloque uma `SECRET_KEY` forte:

```bash
# Gere uma chave segura
openssl rand -hex 32
```

### 3. Suba a aplicação

```bash
sudo docker compose up --build -d
```

A primeira execução pode demorar alguns minutos (download do modelo LaMa).

### 4. Acesse a aplicação

- **Frontend**: http://localhost:3000
- **API Docs**: http://localhost:8000/docs

Crie uma conta e comece a remover marcas d'água!

---

## 📁 Estrutura do Projeto

```
python-cleanly-ai/
├── docker-compose.yml
├── Dockerfile.iopaint
├── README.md
├── LICENSE
├── .env.example
│
├── frontend/                 # Next.js
│   ├── app/
│   └── components/
│
└── python/                   # Backend FastAPI
    ├── app/
    │   ├── engines/          # LaMa Engine
    │   ├── routers/
    │   ├── services/
    │   └── tasks.py
    └── requirements.txt
```

---

## 🎯 Objetivo do Projeto

Este projeto foi criado com os seguintes propósitos:

- Servir como **portfólio técnico** (Full Stack + IA)
- Demonstrar uma arquitetura limpa com **Engines plugáveis**
- Ser um bom material de **estudo** (código bem organizado e comentado)
- Focar em uma funcionalidade excelente (Watermark Removal) em vez de muitas funcionalidades medíocres

---

## 🔒 Privacidade

Todas as imagens e processamentos acontecem **localmente**.  
Nada é enviado para servidores externos.

---

## 📄 Licença

Distribuído sob a licença [MIT](LICENSE).

---

## 👤 Autor

**Iva Martins**  
https://github.com/ivamartins

---

## 🤝 Contribuições

Este é um projeto de estudo e portfólio.  
Sugestões e melhorias são bem-vindas via Pull Request ou Issues.

---

**Feito com foco em qualidade e simplicidade.**
