document.addEventListener('DOMContentLoaded', () => {
    // 获取DOM元素
    const fileListContainer = document.getElementById('file-list-container');
    const searchButton = document.getElementById('searchButton');
    const searchInput = document.getElementById('searchInput');
    const backToTopBtn = document.getElementById('backToTop');
    const goToBottomBtn = document.getElementById('goToBottom');
    const themeToggleBtn = document.getElementById('themeToggle');
    const disclaimerBox = document.getElementById('disclaimerBox');
    const disclaimerClose = document.getElementById('disclaimerClose');
    const languageToggle = document.getElementById('languageToggle');

    // 关闭免责声明
    disclaimerClose.addEventListener('click', () => {
        disclaimerBox.style.display = 'none';
    });

    // 文件过滤功能
    function filterFiles() {
        const searchTerm = searchInput.value.toLowerCase();
        const fileCards = document.querySelectorAll('.file-card');
        let visibleCount = 0;

        fileCards.forEach(card => {
            const fileName = card.querySelector('h3').textContent.toLowerCase();
            const fileDescription = card.querySelector('p').textContent.toLowerCase();

            if (fileName.includes(searchTerm) || fileDescription.includes(searchTerm)) {
                card.style.display = 'flex';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });

        let noResultsMessage = document.getElementById('no-results');

        if (visibleCount === 0 && fileCards.length > 0) {
            if (!noResultsMessage) {
                noResultsMessage = document.createElement('p');
                noResultsMessage.id = 'no-results';
                noResultsMessage.className = 'loading';
                noResultsMessage.textContent = 'No files match your search.';
                fileListContainer.appendChild(noResultsMessage);
            }
        } else if (noResultsMessage) {
            noResultsMessage.remove();
        }
    }

    // 语言切换功能
    languageToggle.addEventListener('click', () => {
        alert("有点累，中文暂时先不做了，将就看吧。");
    });

    // 搜索功能绑定
    searchButton.addEventListener('click', filterFiles);
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') filterFiles();
    });

    // 获取并显示文件列表
    async function fetchAndDisplayFiles() {
        try {
            const response = await fetch('/api/files');

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const files = await response.json();
            fileListContainer.innerHTML = '';

            if (files.length === 0) {
                fileListContainer.innerHTML = '<p class="loading">No code files found in the files directory.</p>';
                return;
            }

            files.forEach(file => {
                // 确定文件图标
                let fileIcon = 'fa-file-code-o';
                if (file.name.endsWith('.html')) fileIcon = 'fa-html5';
                if (file.name.endsWith('.css')) fileIcon = 'fa-css3';
                if (file.name.endsWith('.js')) fileIcon = 'fa-js';
                if (file.name.endsWith('.java')) fileIcon = 'fa-coffee';
                if (file.name.endsWith('.py')) fileIcon = 'fa-python';

                // 创建文件卡片
                const fileCard = document.createElement('div');
                fileCard.className = 'file-card';
                fileCard.style.display = 'flex';

                fileCard.innerHTML = `
                    <div class="file-info">
                        <h3><i class="fa ${fileIcon}"></i>${file.name}</h3>
                        <p>${file.description.replace(/\n/g, '<br>')}</p> 
                    </div>
                    <div class="file-actions">
                        <div class="downloads-count">
                            <i class="fa fa-download"></i> 
                            <span>${file.downloads} downloads</span>
                        </div>
                        <a href="/download/${file.name}" class="download-btn" download>
                            <i class="fa fa-download"></i> Download 
                        </a>
                    </div>
                `;

                fileListContainer.appendChild(fileCard);
            });

        } catch (error) {
            fileListContainer.innerHTML = `<p class="loading">Error loading files: ${error.message}</p>`;
            console.error('Failed to fetch files:', error);
        }
    }

    // 初始化加载文件列表
    fetchAndDisplayFiles();

    // 滚动按钮功能
    window.addEventListener('scroll', updateScrollButtons);
    updateScrollButtons();

    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    goToBottomBtn.addEventListener('click', () => {
        window.scrollTo({
            top: document.body.scrollHeight,
            behavior: 'smooth'
        });
    });

    // 更新滚动按钮显示状态
    function updateScrollButtons() {
        const scrollTop = window.scrollY;
        const windowHeight = window.innerHeight;
        const documentHeight = document.body.scrollHeight;

        // 显示/隐藏回到顶部按钮
        if (scrollTop > 300) {
            backToTopBtn.classList.add('show');
        } else {
            backToTopBtn.classList.remove('show');
        }

        // 显示/隐藏前往底部按钮
        if (scrollTop + windowHeight < documentHeight - 100) {
            goToBottomBtn.classList.add('show');
        } else {
            goToBottomBtn.classList.remove('show');
        }
    }

    // 主题切换功能
    function initTheme() {
        const savedTheme = localStorage.getItem('iCoderTheme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
            document.body.classList.add('dark');
            updateThemeIcon('dark');
        } else {
            document.body.classList.remove('dark');
            updateThemeIcon('light');
        }
    }

    function toggleTheme() {
        const isDark = document.body.classList.toggle('dark');
        document.body.classList.add('theme-transition');

        if (isDark) {
            localStorage.setItem('iCoderTheme', 'dark');
            updateThemeIcon('dark');
        } else {
            localStorage.setItem('iCoderTheme', 'light');
            updateThemeIcon('light');
        }

        setTimeout(() => {
            document.body.classList.remove('theme-transition');
        }, 300);
    }

    function updateThemeIcon(theme) {
        const icon = themeToggleBtn.querySelector('i');
        icon.style.transition = 'transform 0.3s ease';
        icon.style.transform = 'rotate(180deg)';

        setTimeout(() => {
            if (theme === 'dark') {
                icon.className = 'fa fa-sun-o';
                themeToggleBtn.title = 'Switch to daytime mode';
            } else {
                icon.className = 'fa fa-moon-o';
                themeToggleBtn.title = 'Switch to night mode';
            }
            icon.style.transform = 'rotate(0)';
        }, 150);
    }

    // 监听系统主题变化
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', initTheme);

    // 绑定主题切换事件
    themeToggleBtn.addEventListener('click', toggleTheme);

    // 初始化主题
    initTheme();
});
