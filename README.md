# Terminator

**Terminator** is an elegant and efficient solver for the popular game [Termo](https://term.ooo/) (the Portuguese version of Wordle). It helps you find the correct word by allowing you to input your guesses, update the letter states (colors), and suggesting the best possible next guesses to narrow down the target word.

## ✨ Features

- **Interactive Game Board:** A beautiful UI built with Tailwind CSS that mimics the classic Termo grid.
- **Easy Input:** Type your 5-letter attempts and easily click the cells to toggle their states (⚪️ Gray, 🟡 Yellow, 🟢 Green).
- **Smart Suggestions:** Uses an algorithm to filter possible candidates based on your previous attempts.
- **Responsive Design:** Works smoothly on desktop and mobile browsers.
- **Modern Nuxt Architecture:** Built for speed and optimal developer experience using Nuxt and Vue 3.

## 🛠️ Technologies Used

- [Nuxt](https://nuxt.com/)
- [Vue 3](https://vuejs.org/) (Composition API)
- [Tailwind CSS](https://tailwindcss.com/)
- [TypeScript](https://www.typescriptlang.org/)

## 🚀 Getting Started

Follow these steps to run Terminator locally on your machine.

### Prerequisites

Make sure you have Node.js installed.

### Installation

Install the project dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

### Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

### Production Build

To build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview the production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

## 🎮 How to Use the Solver

1. Play your first word on the actual [Termo](https://term.ooo/) game.
2. Open **Terminator** and type the same word into the input area.
3. Click on the letters on the Terminator board to match the colors returned by Termo:
   - **Gray**: Letter is absent from the target word.
   - **Yellow**: Letter is present but in the wrong position.
   - **Green**: Letter is in the correct position.
4. Click "Confirmar" (Confirm).
5. Terminator will instantly show you how many words are still possible and provide a structured list of **Suggestions** on the right side.
6. Pick one of the suggested words and try it in Termo. Repeat this process until you solve the puzzle!
