const http = require('http');
const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const url = require('url');

// 配置常量
const PORT = 3000;
const frontDir = path.join(__dirname, '..', 'front');
const filesDir = path.join(__dirname, 'files');

// 下载计数存储
let downloadCounts = {};

/**
 * 检查目录是否存在，不存在则创建
 * @param {string} dirPath - 目录路径
 */
async function ensureDirectoryExists(dirPath) {
    try {
        await fs.access(dirPath);
    } catch {
        await fs.mkdir(dirPath, { recursive: true });
        console.log(`Created directory: ${dirPath}`);
    }
}

/**
 * 发送文件响应
 * @param {http.ServerResponse} res - 响应对象
 * @param {string} filePath - 文件路径
 * @param {string} contentType - 内容类型
 */
async function serveFile(res, filePath, contentType) {
    try {
        const content = await fs.readFile(filePath);
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
    } catch (err) {
        console.error(`Error serving file ${filePath}:`, err);
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
    }
}

/**
 * 处理文件列表API请求
 * @param {http.ServerResponse} res - 响应对象
 */
async function handleFilesApi(res) {
    try {
        const files = await fs.readdir(filesDir);
        // 1. 过滤掉Markdown文件（保留.zip等代码文件），无需修改
        const codeFiles = files.filter(file => !file.endsWith('.md'));

        // 2. 优化：获取每个文件的描述和下载计数（修复路径拼接和错误处理）
        const fileDataPromises = codeFiles.map(async (file) => {
            // 直接截取文件名（去掉扩展名），避免path.parse可能的隐性问题
            const baseName = file.split('.').slice(0, -1).join('.');
            // 明确拼接.md路径（如IMchat.zip → IMchat.md）
            const mdPath = path.join(filesDir, `${baseName}.md`);

            try {
                // 优化：指定编码为utf8，确保读取.md文件无乱码
                const description = await fs.readFile(mdPath, { encoding: 'utf8' });
                return {
                    name: file,          // 文件名（如IMchat.zip）
                    description,         // .md文件中的描述
                    downloads: downloadCounts[file] || 0
                };
            } catch (err) {
                // 仅打印警告，不阻断其他文件返回（方便调试）
                console.warn(`No description file for ${file}: ${mdPath}`);
                // 即使没有.md文件，也返回该文件（避免空数组）
                return {
                    name: file,
                    description: 'No description available.',
                    downloads: downloadCounts[file] || 0
                };
            }
        });

        const fileData = await Promise.all(fileDataPromises);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(fileData));
    } catch (err) {
        console.error('Error reading files directory:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Could not read files directory' }));
    }
}


/**
 * 处理文件下载请求
 * @param {http.ServerResponse} res - 响应对象
 * @param {string} fileName - 文件名
 */
async function handleDownload(res, fileName) {
    const filePath = path.join(filesDir, fileName);

    try {
        // 检查文件是否存在
        await fs.access(filePath);

        // 更新下载计数
        downloadCounts[fileName] = (downloadCounts[fileName] || 0) + 1;
        console.log(`Downloading ${fileName}, total downloads: ${downloadCounts[fileName]}`);

        // 设置响应头并发送文件
        res.writeHead(200, {
            'Content-Type': 'application/octet-stream',
            'Content-Disposition': `attachment; filename=${fileName}`
        });

        // 使用同步方法创建可读流，因为异步方法在这里更复杂
        const fileStream = fsSync.createReadStream(filePath);
        fileStream.pipe(res);

        // 处理流错误
        fileStream.on('error', (err) => {
            console.error(`Error streaming file ${filePath}:`, err);
            if (!res.headersSent) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Error downloading file');
            }
        });
    } catch (err) {
        console.error(`File not found: ${filePath}`);
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('File not found.');
    }
}

/**
 * 请求处理主函数
 * @param {http.IncomingMessage} req - 请求对象
 * @param {http.ServerResponse} res - 响应对象
 */
async function handleRequest(req, res) {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    try {
        switch (pathname) {
            case '/':
                await serveFile(res, path.join(frontDir, 'index.html'), 'text/html');
                break;
            case '/styles.css':
                await serveFile(res, path.join(frontDir, 'styles.css'), 'text/css');
                break;
            case '/script.js':
                await serveFile(res, path.join(frontDir, 'script.js'), 'application/javascript');
                break;
            case '/Disclaimer.html':
                await serveFile(res, path.join(frontDir, 'Disclaimer.html'), 'text/html');
                break;
            case '/api/files':
                await handleFilesApi(res);
                break;
            case '/favicon.ico':
                // 处理浏览器自动请求的favicon
                res.writeHead(204);
                res.end();
                break;
            default:
                if (pathname.startsWith('/download/')) {
                    const fileName = path.basename(pathname.substring('/download/'.length));
                    await handleDownload(res, fileName);
                } else {
                    res.writeHead(404, { 'Content-Type': 'text/plain' });
                    res.end('404 Not Found');
                }
        }
    } catch (err) {
        console.error('Error handling request:', err);
        if (!res.headersSent) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal Server Error');
        }
    }
}

// 创建并启动服务器
const server = http.createServer(handleRequest);

server.listen(PORT, async () => {
    console.log(`iCoder server is running at http://localhost:${PORT}`);
    // 确保文件目录存在
    await ensureDirectoryExists(filesDir);
});

// 处理服务器错误
server.on('error', (err) => {
    console.error('Server error:', err);
});
