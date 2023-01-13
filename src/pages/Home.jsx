import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCookies } from 'react-cookie'
import axios from 'axios'
import { Header } from '../components/Header'
import { url } from '../const'
import './home.scss'

export function Home() {
  const [isDoneDisplay, setIsDoneDisplay] = useState('todo') // todo->未完了 done->完了
  const [lists, setLists] = useState([])
  const [selectListId, setSelectListId] = useState()
  const [tasks, setTasks] = useState([])
  const [errorMessage, setErrorMessage] = useState('')
  const [cookies] = useCookies()
  const handleIsDoneDisplayChange = e => setIsDoneDisplay(e.target.value)
  useEffect(() => {
    axios
      .get(`${url}/lists`, {
        headers: {
          authorization: `Bearer ${cookies.token}`,
        },
      })
      .then(res => {
        setLists(res.data)
      })
      .catch(err => {
        setErrorMessage(`リストの取得に失敗しました。${err}`)
      })
  }, [])

  useEffect(() => {
    const listId = lists[0]?.id
    if (typeof listId !== 'undefined') {
      setSelectListId(listId)
      axios
        .get(`${url}/lists/${listId}/tasks`, {
          headers: {
            authorization: `Bearer ${cookies.token}`,
          },
        })
        .then(res => {
          setTasks(res.data.tasks)
        })
        .catch(err => {
          setErrorMessage(`タスクの取得に失敗しました。${err}`)
        })
    }
  }, [lists])

  const handleSelectList = id => {
    setSelectListId(id)
    axios
      .get(`${url}/lists/${id}/tasks`, {
        headers: {
          authorization: `Bearer ${cookies.token}`,
        },
      })
      .then(res => {
        setTasks(res.data.tasks)
      })
      .catch(err => {
        setErrorMessage(`タスクの取得に失敗しました。${err}`)
      })
  }
  return (
    <div>
      <Header />
      <main className="taskList">
        <p className="error-message">{errorMessage}</p>
        <div>
          <div className="list-header">
            <h2>リスト一覧</h2>
            <div className="list-menu">
              <p>
                <Link to="/list/new">リスト新規作成</Link>
              </p>
              <p>
                <Link to={`/lists/${selectListId}/edit`}>
                  選択中のリストを編集
                </Link>
              </p>
            </div>
          </div>
          <ul className="list-tab">
            {lists.map((list, key) => {
              const isActive = list.id === selectListId
              return (
                <li
                  key={key}
                  className={`list-tab-item ${isActive ? 'active' : ''}`}
                  onClick={() => handleSelectList(list.id)}
                >
                  {list.title}
                </li>
              )
            })}
          </ul>
          <div className="tasks">
            <div className="tasks-header">
              <h2>タスク一覧</h2>
              <Link to="/task/new">タスク新規作成</Link>
            </div>
            <div className="display-select-wrapper">
              <select
                onChange={handleIsDoneDisplayChange}
                className="display-select"
              >
                <option value="todo">未完了</option>
                <option value="done">完了</option>
              </select>
            </div>
            <Tasks
              tasks={tasks}
              selectListId={selectListId}
              isDoneDisplay={isDoneDisplay}
            />
          </div>
        </div>
      </main>
    </div>
  )
}

// 表示するタスク
function Tasks(props) {
  const { tasks, selectListId, isDoneDisplay } = props
  if (tasks === null) return <></>
  
  if (isDoneDisplay == 'done') {
    return (
      <ul>
        {tasks
          .filter(task => task.done === true)
          .map((task, key) => (
            <li key={key} className="task-item">
              <Link
                to={`/lists/${selectListId}/tasks/${task.id}`}
                className="task-item-link"
                >
                {task.title}
                <br />
                {task.done ? '完了' : '未完了'}
              </Link>
            </li>
          ))}
      </ul>
    )
  }

  return (
    <ul>
      {tasks
        .filter(task => task.done === false)
        .map((task, key) => (
          <li key={key} className="task-item">
            <Link
              to={`/lists/${selectListId}/tasks/${task.id}`}
              className="task-item-link"
            >
              <div>
                {task.title}
                <br />
                {task.done ? '完了' : '未完了'}
              </div>
              <div className='task-item-link-time'>
                {OutputLocalTime(task.limit)}
                <br />
                {CalcRemainTime(task.limit)}
              </div>
            </Link>
          </li>
        ))}
    </ul>
  )
}

function OutputLocalTime(utc) {
  const local = new Date(utc)
  const year = local.getFullYear()
  const month = local.getMonth() + 1
  const day = local.getDate()
  const hours = (local.getHours() != 0 ? local.getHours() : "00")
  const minutes = (local.getMinutes() != 0 ? local.getMinutes() : "00")
  console.log("local: ", local)
  return `期限：　${year}年${month}月${day}日${hours}時${minutes}分`
}

function CalcRemainTime(limit) {
  const limit_date = new Date(limit)
  const now = new Date()
  const diff = limit_date - now
  const diff_d = parseInt(diff / 1000 / 60 / 60 / 24)
  const diff_h = parseInt(diff / 1000 / 60 / 60) % 24
  const diff_m = parseInt(diff / 1000 / 60) % 60
  const diff_s = parseInt(diff / 1000) % 60

  const d = (diff_d != 0 ? `${diff_d}日`: "")
  const h = (diff_h != 0 ? `${diff_h}時間`: "")
  const m = (diff_m != 0 ? `${diff_m}分`: "")
  const s = (diff_s != 0 ? `${diff_s}秒`: "")

  return "残り：　" + d + h + m + s
}
