import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useCookies } from 'react-cookie'
import { useNavigate, useParams } from 'react-router-dom'
import { url } from '../const'
import { Header } from '../components/Header'
import './editTask.scss'

export function EditTask() {
  const navigate = useNavigate()
  const { listId, taskId } = useParams()
  const [cookies] = useCookies()
  const [title, setTitle] = useState('')
  const [detail, setDetail] = useState('')
  const [limit, setLimit] = useState('')
  const [isDone, setIsDone] = useState()
  const [errorMessage, setErrorMessage] = useState('')
  const handleTitleChange = e => setTitle(e.target.value)
  const handleDetailChange = e => setDetail(e.target.value)
  const handleIsDoneChange = e => setIsDone(e.target.value === 'done')
  const handleLimitChange = e => {
    // console.log('e.target.value: ',e.target.value)
    const limitUtc = ChangeToUtcFormat(new Date(e.target.value))
    // console.log('limitUtc: ', limitUtc)
    setLimit(limitUtc)
  }
  // 期限のminに入れる値
  const now = new Date()
  const dateMinBoarder = ChangeToUtcFormat(now)

  const onUpdateTask = () => {
    console.log(isDone)
    const data = {
      title,
      detail,
      done: isDone,
      limit: ChangeToLocalFormat(new Date(limit)).slice(0, -5) + 'Z',
    }

    axios
      .put(`${url}/lists/${listId}/tasks/${taskId}`, data, {
        headers: {
          authorization: `Bearer ${cookies.token}`,
        },
      })
      .then(res => {
        console.log(res.data)
        navigate('/')
      })
      .catch(err => {
        setErrorMessage(`更新に失敗しました。${err}`)
      })
  }

  const onDeleteTask = () => {
    axios
      .delete(`${url}/lists/${listId}/tasks/${taskId}`, {
        headers: {
          authorization: `Bearer ${cookies.token}`,
        },
      })
      .then(() => {
        navigate('/')
      })
      .catch(err => {
        setErrorMessage(`削除に失敗しました。${err}`)
      })
  }

  useEffect(() => {
    axios
      .get(`${url}/lists/${listId}/tasks/${taskId}`, {
        headers: {
          authorization: `Bearer ${cookies.token}`,
        },
      })
      .then(res => {
        const task = res.data
        setTitle(task.title)
        setDetail(task.detail)
        setIsDone(task.done)
        const nowLimit = ChangeToUtcFormat(new Date(task.limit))
        // console.log('nowlimit: ', nowLimit)
        setLimit(nowLimit)
      })
      .catch(err => {
        setErrorMessage(`タスク情報の取得に失敗しました。${err}`)
      })
  }, [])

  return (
    <div>
      <Header />
      <main className="edit-task">
        <h2>タスク編集</h2>
        <p className="error-message">{errorMessage}</p>
        <form className="edit-task-form">
          <label>タイトル</label>
          <br />
          <input
            type="text"
            onChange={handleTitleChange}
            className="edit-task-title"
            value={title}
          />
          <br />
          <label>期限</label>
          <br />
          <input
            id="edit-task-limit"
            type="datetime-local"
            onChange={handleLimitChange}
            className="edit-task-limit"
            min={dateMinBoarder.slice(0, -8)}
            value={limit.slice(0, -8)}
          />
          <br />
          <label>詳細</label>
          <br />
          <textarea
            type="text"
            onChange={handleDetailChange}
            className="edit-task-detail"
            value={detail}
          />
          <br />
          <div>
            <input
              type="radio"
              id="todo"
              name="status"
              value="todo"
              onChange={handleIsDoneChange}
              checked={isDone === false ? 'checked' : ''}
            />
            未完了
            <input
              type="radio"
              id="done"
              name="status"
              value="done"
              onChange={handleIsDoneChange}
              checked={isDone === true ? 'checked' : ''}
            />
            完了
          </div>
          <button
            type="button"
            className="delete-task-button"
            onClick={onDeleteTask}
          >
            削除
          </button>
          <button
            type="button"
            className="edit-task-button"
            onClick={onUpdateTask}
          >
            更新
          </button>
        </form>
      </main>
    </div>
  )
}

function ChangeToUtcFormat(time) {
  // console.log('inputTime: ', time)
  return new Date(
    time.getTime() - time.getTimezoneOffset() * 60 * 1000,
  ).toISOString()
}

function ChangeToLocalFormat(time) {
  // console.log('inputTime: ', time)
  return new Date(
    time.getTime() + time.getTimezoneOffset() * 60 * 1000,
  ).toISOString()
}
