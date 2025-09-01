# iCoder - Open Source Code Sharing Platform  
# iCoder - 开源代码分享平台  

A lightweight web application for sharing and downloading open-source code projects, featuring a clean interface, real-time search, and theme switching capabilities.  
一个轻量级的开源代码分享与下载平台，具有简洁的界面、实时搜索和主题切换功能。  


## ✨ Core Features  
## ✨ 核心功能  

- **Code Repository**: Browse and download various open-source projects  
  - **代码仓库**: 浏览和下载各类开源项目  
- **Real-time Search**: Filter files by name or description instantly  
  - **实时搜索**: 按名称或描述即时筛选文件  
- **Dual Theme Support**: Switch between light and dark modes (automatically adapts to system preferences)  
  - **双主题支持**: 明暗模式切换（自动适配系统偏好）  
- **Responsive Design**: Optimized for both desktop and mobile devices  
  - **响应式设计**: 适配桌面端和移动设备  
- **Download Statistics**: Track download counts for each project  
  - **下载统计**: 记录每个项目的下载次数  


## 🛠️ Tech Stack  
## 🛠️ 技术栈  

### Frontend  
### 前端  
- HTML5 + CSS3 + JavaScript (ES6+)  
- Font Awesome for icons  
- Responsive layout with CSS variables  


### Backend  
### 后端  
- Node.js with native `http` module  
- File system operations via `fs` module  
- RESTful API design  


## 🚀 Getting Started  
## 🚀 快速开始  

### Prerequisites  
### 前置要求  
- Node.js 14+ and npm  
- Git  


### Installation Steps  
### 安装步骤  

1. Clone the repository  
   克隆仓库  
   ```bash  
   git clone https://github.com/y-jingyao/icoder.git  
   cd icoder  
   ```  

2. Start the server  
   启动服务器  
   ```bash  
   node back/server.js  
   ```  

3. Open in browser  
   在浏览器中打开  
   Visit `http://localhost:3000`  


## 📁 Project Structure  
## 📁 项目结构  
icoder/  
├── back/                 # Backend code  
│   ├── server.js         # Main server file  
│   └── files/            # Storage for code files and descriptions  
├── front/                # Frontend code  
│   ├── index.html        # Main page  
│   ├── styles.css        # Styling (with theme support)  
│   ├── script.js         # Interactive functionality  
│   └── Disclaimer.html   # Legal disclaimer  



## 📄 License  
## 📄 许可证  

[MIT](LICENSE)
