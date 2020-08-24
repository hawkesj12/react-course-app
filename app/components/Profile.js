import React, { useEffect, useContext } from "react"
import Page from "./Page"
import { useParams } from "react-router-dom"
import Axios from "axios"
import StateContext from "../StateContext"
import ProfilePosts from "./ProfilePosts"
import { useImmer } from "use-immer"

function Profile() {
  const { username } = useParams()
  const appState = useContext(StateContext)
  const [state, setState] = useImmer({
    followActionLoading: false,
    startFollowingRequestCount: 0,
    stopFollowingRequestCount: 0,
    profileData: {
      profileUsername: "",
      profileAvatar: "http://gravatar.com/avatar/placeholder?s=128",
      isFollowing: false,
      counts: {
        followerCount: "",
        followingCount: "",
        postCount: ""
      }
    }
  })

  useEffect(() => {
    const ourRequest = Axios.CancelToken.source()

    async function fetchData() {
      try {
        const response = await Axios.post(`/profile/${username}`, { token: appState.user.token })
        setState(draft => {
          draft.profileData = response.data
        })
      } catch (e) {
        console.log("There was an error or the request was canceled")
      }
    }
    fetchData()
    return () => {
      ourRequest.cancel()
    }
  }, [username])

  useEffect(() => {
    if (state.startFollowingRequestCount) {
      setState(draft => {
        draft.followActionLoading = true
      })
      const ourRequest = Axios.CancelToken.source()

      async function fetchData() {
        try {
          const response = await Axios.post(`/addFollow/${state.profileData.profileUsername}`, { token: appState.user.token })
          setState(draft => {
            draft.profileData.isFollowing = true
            draft.profileData.counts.followerCount++
            draft.followActionLoading = false
          })
        } catch (e) {
          console.log("There was an error or the request was canceled")
        }
      }
      fetchData()
      return () => {
        ourRequest.cancel()
      }
    }
  }, [state.startFollowingRequestCount])

  useEffect(() => {
    if (state.stopFollowingRequestCount) {
      setState(draft => {
        draft.followActionLoading = true
      })
      const ourRequest = Axios.CancelToken.source()

      async function fetchData() {
        try {
          const response = await Axios.post(`/removeFollow/${state.profileData.profileUsername}`, { token: appState.user.token })
          setState(draft => {
            draft.profileData.isFollowing = false
            draft.profileData.counts.followerCount--
            draft.followActionLoading = false
          })
        } catch (e) {
          console.log("There was an error or the request was canceled")
        }
      }
      fetchData()
      return () => {
        ourRequest.cancel()
      }
    }
  }, [state.stopFollowingRequestCount])

  function startFollowing() {
    setState(draft => {
      draft.startFollowingRequestCount++
    })
  }

  function stopFollowing() {
    setState(draft => {
      draft.stopFollowingRequestCount++
    })
  }

  const showFollowButton = appState.loggedIn && !state.profileData.isFollowing && appState.user.username != state.profileData.profileUsername && state.profileData.profileUsername != ""
  const showStopFollowButton = appState.loggedIn && state.profileData.isFollowing && appState.user.username != state.profileData.profileUsername && state.profileData.profileUsername != ""

  return (
    <Page title='Profile Page'>
      <div className='container container--narrow py-md-5'>
        <h2>
          <img className='avatar-small' src={state.profileData.profileAvatar} /> {state.profileData.profileUsername}
          <button onClick={startFollowing} disabled={state.followActionLoading} className='btn btn-primary btn-sm ml-2' hidden={!showFollowButton}>
            Follow <i className='fas fa-user-plus'></i>
          </button>
          <button onClick={stopFollowing} disabled={state.followActionLoading} className='btn btn-danger btn-sm ml-2' hidden={!showStopFollowButton}>
            Stop Following <i className='fas fa-user-times'></i>
          </button>
        </h2>

        <div className='profile-nav nav nav-tabs pt-2 mb-4'>
          <a href='#' className='active nav-item nav-link'>
            Posts: {state.profileData.counts.postCount}
          </a>
          <a href='#' className='nav-item nav-link'>
            Followers: {state.profileData.counts.followerCount}
          </a>
          <a href='#' className='nav-item nav-link'>
            Following: {state.profileData.counts.followingCount}
          </a>
        </div>

        <ProfilePosts />
      </div>
    </Page>
  )
}

export default Profile
