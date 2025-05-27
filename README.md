# Bloom Filter Visualizer

> **Challenge to the Owner:**
> 
> This project was created as a unique challenge: to build a complete, interactive Bloom Filter visualizer using only AI agents (like GitHub Copilot or similar tools), without writing code manually. The goal was to see if an agent-driven workflow could produce a modern, maintainable, and feature-rich application from scratch, even when the developer did not fully understand all implementation details at the outset.
> 
> If you're reading this and are the owner, consider continuing the experiment—try to make all future changes and features using only agent assistance, and see how far you can push the boundaries of agent-driven software development!

A modern, interactive visualization of Bloom Filters implemented in React with TypeScript and Vite. This application demonstrates how Bloom Filters work with animated visualizations.

## Features

- Interactive bit array visualization
- Add and check words with real-time animations
- Multiple hash functions (configurable)
- Adjustable filter size
- History log of all operations
- Responsive design
- Built with React, TypeScript, and Vite for fast performance

## What is a Bloom Filter?

A Bloom filter is a space-efficient probabilistic data structure used to test whether an element is a member of a set. False positive matches are possible, but false negatives are not – when a Bloom filter reports that an element is not in the set, it definitely is not.

The filter uses multiple hash functions to map each element to several positions in a bit array. When checking if an element exists, if any of the mapped bits are 0, the element is definitely not in the set. If all are 1, the element might be in the set.

## Getting Started

### Prerequisites

- Bun 1.0 or higher

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/bloom-filter-visualizer.git
cd bloom-filter-visualizer
```

2. Install dependencies:
```bash
bun install
```

### Running the application

The easiest way to run the application is to use the included script:

```bash
./run.sh
```

This script will automatically use Bun to run the application.

Alternatively, you can run it directly with:

```bash
bun run dev
```

The application will be available at http://localhost:5173

### Building for production

```bash
bun run build
```

## Implementation Details

This application is built using:

- **React**: For component-based UI
- **TypeScript**: For type-safe code
- **Vite**: For fast development and build
- **CSS Modules**: For component-scoped styling
- **Context API**: For state management

## Project Structure

- `src/components/`: React components
- `src/contexts/`: React context providers
- `src/hooks/`: Custom React hooks
- `src/utils/`: Utility classes and functions

## Deployment

This project is set up for easy deployment to GitHub Pages with two methods:

### Method 1: Automated Deployment (Recommended)

The project includes a GitHub Actions workflow that automatically builds and deploys to GitHub Pages when you push to the main branch. The workflow:

1. Installs dependencies using Bun
2. Builds the project for production
3. Deploys to GitHub Pages

Simply push your changes to the main branch and the site will be automatically deployed to:
**https://prabhavagrawal7.github.io/BloomFilterVisualizer**

### Method 2: Manual Deployment

You can also deploy manually using the gh-pages package:

```bash
# Build the project
bun run build

# Deploy to GitHub Pages
bun run deploy
```

### Live Demo

The application is deployed and available at:
**https://prabhavagrawal7.github.io/BloomFilterVisualizer**

## License

This project is licensed under the MIT License - see the LICENSE file for details.
