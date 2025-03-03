import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  // Load environment variables from the custom `frontend/env/` directory
  const env = loadEnv(mode, process.cwd() + '/frontend/env');

  return {
    root: 'frontend',  // Set the project root to 'frontend'
    base: '/',  // Ensures correct URL paths
    build: {
      outDir: 'dist',  // Output folder at the project root
      emptyOutDir: true,   // Clears old builds before generating new ones
      rollupOptions: {
        treeshake: false,
        input: {
          editorScript: '/paper/view/origami_editor/editor.ts',
          viewerScript: '/paper/view/origami_viewer/viewer.ts',
          communityboardScript: '/community/communityboard.ts',
          userSignupScript: '/user/signup.ts',
          userLoginScript: '/user/login.ts',
          editor: '/paper/view/origami_editor/editor.html',
          viewer: '/paper/view/origami_viewer/viewer.html',
          communityboard: '/community/communityboard.html',
          userSignup: '/user/signup.html',
          userLogin: '/user/login.html',
          notFound: '/misc/404.html',
          serverError: '/misc/50x.html'
        },
      },
    },
    server: {
      port: 5173,  // Development server port
      open: true,  // Opens browser automatically
    },
    define: {
      'import.meta.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL),
      'import.meta.env.VITE_FRONTEND_URL': JSON.stringify(env.VITE_FRONTEND_URL)
    }
  };
});