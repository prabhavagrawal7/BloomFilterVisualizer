# Bloom Filter Visualizer

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

- Node.js 14.0 or higher
- npm or Bun (for faster performance)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/bloom-filter-visualizer.git
cd bloom-filter-visualizer
```

2. Install dependencies:
```bash
npm install
# or with Bun for faster installation
bun install
```

### Running the application

The easiest way to run the application is to use the included script:

```bash
./run.sh
```

This script will automatically detect if Bun is available and use it for better performance, or fall back to npm if Bun is not installed.

Alternatively, you can run it directly with:

#### Using npm:
```bash
npm run dev
```

#### Using Bun (faster):
```bash
bun run dev:bun
```

The application will be available at http://localhost:5173

### Building for production

#### Using npm:
```bash
npm run build
```

#### Using Bun (faster):
```bash
bun run build:bun
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

## License

This project is licensed under the MIT License - see the LICENSE file for details.
