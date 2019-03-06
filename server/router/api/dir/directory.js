const fs = require('fs-extra');
const services = require('../../../services');

async function getFiles(path) {
  const dirFiles = await fs.readdir(
    services.resolve(services.config.get('server:rootDir'), path),
    { withFileTypes: true },
  );
  const files = [];
  for (const file of dirFiles) {
    if (file.name[0] !== '.') {
      const filePath = services.join(path, file.name);
      const fullPath = services.join(
        services.config.get('server:rootDir'),
        filePath,
      );
      const { mtimeMs, size, mtime } = await fs.stat(fullPath);
      const encodedPath = services.encodePath(filePath);
      let link = '';
      if (file.isDirectory()) {
        link = `/home/${encodedPath}`;
      } else {
        link = `${services.config.get(
          'server:apiBaseUrl',
        )}/download/file/${encodedPath}`;
      }
      let isZippable = true;
      if (file.isDirectory()) {
        const subFiles = await fs.readdir(fullPath);
        isZippable = subFiles.length > 0;
      }
      const zipLink = `${services.config.get(
        'server:apiBaseUrl',
      )}/download/zip/${encodedPath}`;
      files.push({
        name: file.name,
        mtimeMs,
        size,
        mtime,
        fullPath,
        path: filePath,
        encodedPath,
        isDirectory: file.isDirectory(),
        link,
        zipLink,
        isZippable,
      });
    }
  }
  return files;
}

module.exports = function() {
  return async function dirMiddleware(ctx) {
    ctx.params.path = ctx.params.path || '';
    ctx.body = await getFiles(services.decodePath(ctx.params.path));
  };
};
