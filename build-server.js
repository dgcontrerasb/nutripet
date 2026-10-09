import esbuild from 'esbuild';

async function run() {
  try {
    await esbuild.build({
      entryPoints: ['server.ts'],
      bundle: true,
      platform: 'node',
      format: 'cjs',
      packages: 'external',
      outfile: 'dist/server.cjs',
    });
    console.log('✅ Server compilado exitosamente con esbuild');
  } catch (error) {
    console.error('❌ Error compilando server:', error);
    process.exit(1);
  }
}

run();