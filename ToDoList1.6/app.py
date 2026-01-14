# app.py
from flask import Flask, render_template, request, jsonify, redirect, url_for, flash
from flask import session as flask_session
from datetime import datetime
import json
import os
import uuid
from functools import wraps

app = Flask(__name__)
app.secret_key = 'your-secret-key-here'  # 用于flash消息，生产环境需要更安全

# 数据文件路径
DATA_FILE = "todo_data.json"


def load_tasks():
    """加载任务数据"""
    if os.path.exists(DATA_FILE):
        try:
            with open(DATA_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except (json.JSONDecodeError, IOError):
            return []
    return []


def save_tasks(tasks):
    """保存任务数据"""
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(tasks, f, ensure_ascii=False, indent=2)


def get_statistics(tasks):
    """获取统计信息"""
    total = len(tasks)
    completed = sum(1 for task in tasks if task.get('status') == '已完成')
    pending = total - completed

    return {
        'total': total,
        'completed': completed,
        'pending': pending,
        'completion_rate': round(completed / total * 100, 1) if total > 0 else 0
    }


@app.route('/')
def index():
    """首页 - 显示所有任务"""
    tasks = load_tasks()
    stats = get_statistics(tasks)

    # 获取过滤参数
    filter_type = request.args.get('filter', 'all')
    search_query = request.args.get('search', '')

    # 应用过滤
    if filter_type == 'completed':
        tasks = [task for task in tasks if task.get('status') == '已完成']
    elif filter_type == 'pending':
        tasks = [task for task in tasks if task.get('status') == '未完成']

    # 应用搜索
    if search_query:
        search_lower = search_query.lower()
        tasks = [
            task for task in tasks
            if (search_lower in task.get('title', '').lower() or
                search_lower in task.get('description', '').lower())
        ]

    # 获取优先级分类
    priority_counts = {
        '高': len([t for t in tasks if t.get('priority') == '高']),
        '中': len([t for t in tasks if t.get('priority') == '中']),
        '低': len([t for t in tasks if t.get('priority') == '低'])
    }

    return render_template('index.html',
                           tasks=tasks,
                           stats=stats,
                           filter_type=filter_type,
                           search_query=search_query,
                           priority_counts=priority_counts)


@app.route('/add', methods=['POST'])
def add_task():
    """添加新任务"""
    title = request.form.get('title', '').strip()
    if not title:
        flash('任务标题不能为空！', 'error')
        return redirect(url_for('index'))

    description = request.form.get('description', '').strip()
    priority = request.form.get('priority', '中')
    category = request.form.get('category', '其他')

    tasks = load_tasks()

    task = {
        'id': str(uuid.uuid4())[:8],  # 生成简短ID
        'title': title,
        'description': description,
        'priority': priority,
        'category': category,
        'status': '未完成',
        'created_at': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        'completed_at': None
    }

    tasks.append(task)
    save_tasks(tasks)

    flash(f'任务 "{title}" 添加成功！', 'success')
    return redirect(url_for('index'))


@app.route('/complete/<task_id>')
def complete_task(task_id):
    """标记任务为完成"""
    tasks = load_tasks()

    for task in tasks:
        if task.get('id') == task_id:
            if task.get('status') == '未完成':
                task['status'] = '已完成'
                task['completed_at'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                save_tasks(tasks)
                flash(f'任务 "{task["title"]}" 已完成！', 'success')
            else:
                task['status'] = '未完成'
                task['completed_at'] = None
                save_tasks(tasks)
                flash(f'任务 "{task["title"]}" 已标记为未完成', 'info')
            break

    return redirect(url_for('index'))


@app.route('/edit/<task_id>', methods=['GET', 'POST'])
def edit_task(task_id):
    """编辑任务"""
    tasks = load_tasks()
    task_to_edit = None

    for task in tasks:
        if task.get('id') == task_id:
            task_to_edit = task
            break

    if not task_to_edit:
        flash('未找到该任务', 'error')
        return redirect(url_for('index'))

    if request.method == 'POST':
        # 更新任务信息
        task_to_edit['title'] = request.form.get('title', '').strip()
        task_to_edit['description'] = request.form.get('description', '').strip()
        task_to_edit['priority'] = request.form.get('priority', '中')
        task_to_edit['category'] = request.form.get('category', '其他')

        save_tasks(tasks)
        flash('任务更新成功！', 'success')
        return redirect(url_for('index'))

    return render_template('index.html', tasks=tasks, edit_task=task_to_edit)


@app.route('/delete/<task_id>')
def delete_task(task_id):
    """删除任务"""
    tasks = load_tasks()

    for i, task in enumerate(tasks):
        if task.get('id') == task_id:
            deleted_title = task['title']
            del tasks[i]
            save_tasks(tasks)
            flash(f'任务 "{deleted_title}" 已删除', 'warning')
            break

    return redirect(url_for('index'))


@app.route('/clear_completed')
def clear_completed():
    """清空已完成任务"""
    tasks = load_tasks()

    completed_count = len([t for t in tasks if t.get('status') == '已完成'])

    if completed_count == 0:
        flash('没有已完成的任务', 'info')
        return redirect(url_for('index'))

    # 只保留未完成的任务
    tasks = [task for task in tasks if task.get('status') != '已完成']
    save_tasks(tasks)

    flash(f'已清空 {completed_count} 个已完成任务', 'warning')
    return redirect(url_for('index'))


@app.route('/api/tasks', methods=['GET'])
def api_get_tasks():
    """API：获取所有任务（JSON格式）"""
    tasks = load_tasks()
    return jsonify(tasks)


@app.route('/api/tasks/<task_id>', methods=['GET'])
def api_get_task(task_id):
    """API：获取单个任务"""
    tasks = load_tasks()

    for task in tasks:
        if task.get('id') == task_id:
            return jsonify(task)

    return jsonify({'error': 'Task not found'}), 404


@app.errorhandler(404)
def page_not_found(e):
    """404错误处理"""
    return render_template('404.html'), 404


if __name__ == '__main__':
    # 确保数据文件存在
    if not os.path.exists(DATA_FILE):
        with open(DATA_FILE, 'w', encoding='utf-8') as f:
            json.dump([], f)

    # 运行应用
    app.run(debug=True, host='0.0.0.0', port=5000)



#问题报告
@app.route('/api/report-problem', methods=['POST'])
def report_problem():
    """简单保存问题报告"""
    try:
        data = request.get_json()
        print(f"收到问题报告: {data}")
        
        # 简单保存到文件
        import json
        with open('reports.txt', 'a', encoding='utf-8') as f:
            f.write(f"{datetime.now()}: {json.dumps(data, ensure_ascii=False)}\n")
        
        return jsonify({'success': True, 'message': '已收到反馈'})
    except:
        return jsonify({'success': False, 'message': '处理失败'}), 500