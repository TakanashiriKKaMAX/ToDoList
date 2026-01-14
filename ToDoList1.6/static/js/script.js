// static/js/script.js


// 等待页面完全加载后执行
document.addEventListener('DOMContentLoaded', function() {
    console.log('待办事项应用JavaScript已加载');
    

    
    // ========================================
    // 实时任务统计更新（简单示例）
    // ========================================
    function updateTaskStats() {
        // 获取所有任务项
        const taskItems = document.querySelectorAll('.task-item');
        // 获取已完成的任务项
        const completedTasks = document.querySelectorAll('.task-item.completed');
        
        // 在控制台输出统计信息（用于调试）
        console.log(`总任务: ${taskItems.length}, 已完成: ${completedTasks.length}`);
        
        // 这里可以扩展为更新页面上的统计显示
        // 例如：动态更新统计卡片中的数字
    }
    
    // ========================================
    // 表单验证增强
    // ========================================
    const forms = document.querySelectorAll('form');  // 获取所有表单
    forms.forEach(form => {
        // 为每个表单添加提交事件监听器
        form.addEventListener('submit', function(e) {
            // 获取表单中所有必填字段
            const requiredFields = form.querySelectorAll('[required]');
            let valid = true;  // 验证结果标志
            
            // 遍历所有必填字段
            requiredFields.forEach(field => {
                // 检查字段是否为空（去除首尾空格）
                if (!field.value.trim()) {
                    valid = false;  // 验证失败
                    
                    // 添加红色边框提示错误
                    field.style.borderColor = '#dc3545';
                    
                    // 检查是否已经有错误提示信息
                    if (!field.nextElementSibling || !field.nextElementSibling.classList.contains('error-message')) {
                        // 创建错误提示元素
                        const errorMsg = document.createElement('div');
                        errorMsg.className = 'error-message';
                        errorMsg.style.color = '#dc3545';
                        errorMsg.style.fontSize = '0.85rem';
                        errorMsg.style.marginTop = '5px';
                        errorMsg.textContent = '此字段为必填项';
                        
                        // 将错误提示插入到字段后面
                        field.parentNode.appendChild(errorMsg);
                    }
                } else {
                    // 字段有效，恢复默认边框颜色
                    field.style.borderColor = '';
                    
                    // 移除错误提示信息（如果存在）
                    const errorMsg = field.parentNode.querySelector('.error-message');
                    if (errorMsg) {
                        errorMsg.remove();
                    }
                }
            });
            
            // 如果有字段验证失败，阻止表单提交
            if (!valid) {
                e.preventDefault();  // 阻止默认提交行为
                alert('请填写所有必填字段！');  // 显示提示框
            }
        });
    });
    
    // ========================================
    // 任务完成动画效果
    // ========================================
    const checkButtons = document.querySelectorAll('.check-btn');
    checkButtons.forEach(button => {
        // 为每个完成任务按钮添加点击事件
        button.addEventListener('click', function(e) {
            // 找到最近的父级任务项
            const taskItem = this.closest('.task-item');
            if (taskItem) {
                // 设置过渡动画
                taskItem.style.transition = 'all 0.5s ease';
                
                // 切换完成状态
                if (taskItem.classList.contains('completed')) {
                    taskItem.classList.remove('completed');  // 取消完成状态
                    console.log('任务标记为未完成');
                } else {
                    taskItem.classList.add('completed');  // 标记为完成状态
                    console.log('任务标记为已完成');
                }
                
                // 延迟更新统计信息，让动画先完成
                setTimeout(updateTaskStats, 500);
            }
        });
    });
    
    // ========================================
    // 搜索框自动提交（防抖优化）
    // ========================================
    const searchInput = document.querySelector('.search-box input');
    if (searchInput) {
        let searchTimer;  // 定时器变量
        
        // 监听搜索框输入事件
        searchInput.addEventListener('input', function() {
            // 清除之前的定时器
            clearTimeout(searchTimer);
            
            // 设置新的定时器，500毫秒后自动提交
            searchTimer = setTimeout(() => {
                console.log('搜索关键词:', this.value);
                this.closest('form').submit();  // 提交搜索表单
            }, 500);  // 延迟500毫秒，避免频繁提交
        });
        
        // 添加清除搜索的按钮（可选增强功能）
        const clearSearchBtn = document.createElement('button');
        clearSearchBtn.type = 'button';
        clearSearchBtn.innerHTML = '<i class="fas fa-times"></i>';
        clearSearchBtn.style.background = 'transparent';
        clearSearchBtn.style.border = 'none';
        clearSearchBtn.style.cursor = 'pointer';
        clearSearchBtn.style.padding = '0 10px';
        clearSearchBtn.title = '清除搜索';
        
        // 插入清除按钮到搜索框后面
        searchInput.parentNode.appendChild(clearSearchBtn);
        
        // 清除按钮点击事件
        clearSearchBtn.addEventListener('click', function() {
            searchInput.value = '';  // 清空搜索框
            searchInput.closest('form').submit();  // 提交空搜索
        });
    }
    
    // ========================================
    // 应用优先级颜色编码
    // ========================================
    function applyPriorityColors() {
        // 获取所有优先级标签
        const priorityBadges = document.querySelectorAll('.task-priority');
        
        priorityBadges.forEach(badge => {
            // 获取优先级文本并去除空格
            const priority = badge.textContent.trim();
            
            // 重置类名
            badge.className = 'task-priority';
            
            // 根据优先级添加对应的CSS类
            if (priority.includes('高')) {
                badge.classList.add('priority-高');
                console.log('应用高优先级样式');
            } else if (priority.includes('中')) {
                badge.classList.add('priority-中');
                console.log('应用中优先级样式');
            } else if (priority.includes('低')) {
                badge.classList.add('priority-低');
                console.log('应用低优先级样式');
            }
        });
    }
    
    // 初始应用优先级颜色
    applyPriorityColors();
    
    // ========================================
    // 确认删除对话框增强
    // ========================================
    const deleteButtons = document.querySelectorAll('a[onclick*="confirm"]');
    deleteButtons.forEach(button => {
        // 为每个删除按钮添加点击事件
        button.addEventListener('click', function(e) {
            // 使用自定义确认对话框
            if (!confirm('确定要删除吗？此操作不可撤销。')) {
                e.preventDefault();  // 如果用户取消，阻止链接跳转
                console.log('用户取消了删除操作');
            } else {
                console.log('用户确认删除操作');
            }
        });
    });
    
    // ========================================
    // 键盘快捷键支持
    // ========================================
    document.addEventListener('keydown', function(e) {
        console.log('按键按下:', e.key, 'Ctrl键:', e.ctrlKey);
        
        // Ctrl + N: 聚焦到新建任务表单
        if (e.ctrlKey && e.key === 'n') {
            e.preventDefault();  // 阻止浏览器默认新建窗口行为
            console.log('快捷键 Ctrl+N: 聚焦到任务输入框');
            
            if (titleInput) {
                titleInput.focus();  // 聚焦到标题输入框
                titleInput.select();  // 选中所有文本（可选）
            }
        }
        
        // ESC 键: 清除搜索内容
        if (e.key === 'Escape' && searchInput && searchInput.value) {
            console.log('快捷键 ESC: 清除搜索');
            searchInput.value = '';  // 清空搜索框
            searchInput.closest('form').submit();  // 提交空搜索
        }
        
        // 其他可能的快捷键（可以根据需要添加）
        // Ctrl + F: 聚焦到搜索框
        if (e.ctrlKey && e.key === 'f') {
            e.preventDefault();
            if (searchInput) {
                searchInput.focus();
                console.log('快捷键 Ctrl+F: 聚焦到搜索框');
            }
        }
        
        // Enter 键在搜索框：直接提交
        if (e.key === 'Enter' && document.activeElement === searchInput) {
            console.log('搜索框按下 Enter: 提交搜索');
            // 不需要额外处理，表单会自动提交
        }
    });
    
    // ========================================
    // 任务排序功能（示例扩展）
    // ========================================
    function initializeSorting() {
        console.log('初始化排序功能');
        // 这里可以添加按日期、优先级排序的功能
        // 例如：添加排序按钮和对应的排序逻辑
    }
    
    // 初始化排序功能
    initializeSorting();
    
    // ========================================
    //  数据自动保存提示（示例扩展）
    // ========================================
    let autoSaveTimer;
    
    function setupAutoSaveIndicator() {
        const textareas = document.querySelectorAll('textarea');
        const inputs = document.querySelectorAll('input[type="text"], input[type="date"]');
        
        // 合并所有输入元素
        const allInputs = [...textareas, ...inputs];
        
        allInputs.forEach(input => {
            input.addEventListener('input', function() {
                // 显示"正在保存..."提示
                showSaveIndicator();
                
                // 清除之前的定时器
                clearTimeout(autoSaveTimer);
                
                // 设置新的定时器（模拟自动保存）
                autoSaveTimer = setTimeout(() => {
                    hideSaveIndicator();
                    console.log('数据已自动保存（模拟）');
                }, 1000);
            });
        });
    }
    
    function showSaveIndicator() {
        // 创建或显示保存指示器
        let indicator = document.querySelector('.save-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.className = 'save-indicator';
            indicator.style.position = 'fixed';
            indicator.style.bottom = '20px';
            indicator.style.right = '20px';
            indicator.style.background = '#4CAF50';
            indicator.style.color = 'white';
            indicator.style.padding = '10px 15px';
            indicator.style.borderRadius = '5px';
            indicator.style.zIndex = '1000';
            indicator.innerHTML = '<i class="fas fa-save"></i> 正在保存...';
            document.body.appendChild(indicator);
        }
        indicator.style.display = 'block';
    }
    
    function hideSaveIndicator() {
        const indicator = document.querySelector('.save-indicator');
        if (indicator) {
            indicator.style.display = 'none';
        }
    }
    
    // 初始化自动保存提示（如果需要）
    // setupAutoSaveIndicator();
    
    // ========================================
    //  控制台欢迎信息
    // ========================================
    console.log('🎯 待办事项应用已就绪');
    console.log('可用快捷键：');
    console.log('  Ctrl + N - 新建任务');
    console.log('  Ctrl + F - 搜索任务');
    console.log('  ESC     - 清除搜索');
    console.log('============================');
});

// ========================================
//  工具函数（可在其他文件中使用）
// ========================================

/**
 * 格式化日期
 * @param {Date} date - 日期对象
 * @param {string} format - 格式字符串
 * @returns {string} 格式化后的日期
 */
function formatDate(date, format = 'YYYY-MM-DD') {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return format
        .replace('YYYY', year)
        .replace('MM', month)
        .replace('DD', day);
}

/**
 * 验证日期是否有效
 * @param {string} dateString - 日期字符串
 * @returns {boolean} 是否有效
 */
function isValidDate(dateString) {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
}

/**
 * 计算日期差异（天数）
 * @param {string} date1 - 第一个日期
 * @param {string} date2 - 第二个日期
 * @returns {number} 相差天数
 */
function getDaysDifference(date1, date2) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2 - d1);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// ========================================
//  导出工具函数（如果使用模块系统）
// ========================================
// 注意：当前不是模块系统，这里只是示例
// export { formatDate, isValidDate, getDaysDifference };

// ========================================
//  调试辅助函数
// ========================================

/**
 * 在控制台显示应用状态
 */
function showAppStatus() {
    const taskCount = document.querySelectorAll('.task-item').length;
    const completedCount = document.querySelectorAll('.task-item.completed').length;
    const pendingCount = taskCount - completedCount;
    
    console.group('📊 应用状态');
    console.log(`总任务数: ${taskCount}`);
    console.log(`已完成: ${completedCount}`);
    console.log(`待完成: ${pendingCount}`);
    console.log(`完成率: ${taskCount > 0 ? Math.round((completedCount / taskCount) * 100) : 0}%`);
    console.groupEnd();
}

// 可以通过在控制台输入 showAppStatus() 来查看状态
window.showAppStatus = showAppStatus;

/**
 * 测试函数 - 添加示例任务
 */
function addSampleTask() {
    console.log('添加示例任务（仅供测试）');
    // 这里可以模拟添加测试任务
}

// ========================================
//  页面卸载前的确认（防止数据丢失）
// ========================================
window.addEventListener('beforeunload', function(e) {
    // 检查是否有未保存的表单数据
    const forms = document.querySelectorAll('form');
    let hasUnsavedChanges = false;
    
    forms.forEach(form => {
        // 这里可以根据需要实现更复杂的检查逻辑
        // 例如：检查表单字段是否被修改过
    });
    
    // 如果有未保存的更改，显示确认对话框
    if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '您有未保存的更改，确定要离开吗？';
        return e.returnValue;
    }
});

// ========================================
//  页面可见性变化处理
// ========================================
document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'visible') {
        console.log('页面重新获得焦点，可以刷新数据');
        // 可以在这里添加数据刷新逻辑
    } else {
        console.log('页面失去焦点');
    }
    });

    
// ========================================
// js文件结束
// ========================================