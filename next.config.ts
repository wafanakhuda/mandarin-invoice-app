// next.config.js - For Next.js 15
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next.js 15 optimizations
  experimental: {
    // Enable React 19 features if needed
    reactCompiler: false,
  },
  
  // ESLint configuration for build
  eslint: {
    dirs: ['app', 'src'],
    ignoreDuringBuilds: false, // Set to true if you want to skip linting during build
  },
  
  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: false, // Set to true to ignore TypeScript errors during build
  },
  
  // Turbopack configuration (you're using --turbopack flag)
  turbo: {
    rules: {
      // Add any turbopack specific rules if needed
    }
  }
}

module.exports = nextConfig
