document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const bookmarkList = document.getElementById('bookmarkList');

    // 搜索收藏夹
    function searchBookmarks(keyword) {
        chrome.bookmarks.search(keyword, function(results) {
            if (results.length === 0) {
                const bookmarkList = document.getElementById('bookmarkList');
                bookmarkList.innerHTML = '<li>收藏夹没有相关的内容</li>';
            } else {
                displayBookmarks(results);
            }
        });
    }

    // 显示收藏夹
    function displayBookmarks(bookmarks) {
        bookmarkList.innerHTML = '';
        bookmarks.forEach((bookmark, index) => {
            if (bookmark.url) {
                const li = document.createElement('li');
                li.innerHTML = `
                    <span>${index + 1}. </span>
                    <a href="${bookmark.url}" target="_blank">${bookmark.title || bookmark.url}</a>
                `;
                bookmarkList.appendChild(li);
            }
        });
    }

    // 处理用户输入命令
    function handleCommand(command) {
        const openIndexMatch = command.match(/请打开第(\d+)个网址/);
        if (openIndexMatch) {
            const index = parseInt(openIndexMatch[1]) - 1;
            const links = bookmarkList.querySelectorAll('a');
            if (index >= 0 && index < links.length) {
                chrome.tabs.create({ url: links[index].href });
            }
        } else {
            // 保留原有的命令处理逻辑
            const openIndexMatchOld = command.match(/打开第(\d+)个网址/);
            if (openIndexMatchOld) {
                const index = parseInt(openIndexMatchOld[1]) - 1;
                const links = bookmarkList.querySelectorAll('a');
                if (index >= 0 && index < links.length) {
                    chrome.tabs.create({ url: links[index].href });
                }
            } else {
                const openNameMatch = command.match(/打开(.*)的网址/);
                if (openNameMatch) {
                    const name = openNameMatch[1];
                    chrome.bookmarks.search(name, function(results) {
                        if (results.length > 0 && results[0].url) {
                            chrome.tabs.create({ url: results[0].url });
                        }
                    });
                }
            }
        }
    }

    // 监听搜索按钮点击事件
    searchButton.addEventListener('click', function() {
        const keyword = searchInput.value;
        if (keyword.startsWith('打开')) {
            handleCommand(keyword);
        } else {
            searchBookmarks(keyword);
        }
    });

    // 监听回车键
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchButton.click();
        }
    });
});