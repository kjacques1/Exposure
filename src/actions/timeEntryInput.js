import firebase from '../configureFirebase'
import * as types from '../constants/ActionTypes'
import {actionStart, actionFailed, actionSuccess} from './utils/template'

export const changeText = (uid, text) => {
  return function(dispatch) {
    dispatch(actionStart(types.TIME_ENTRY_INPUT__CHANGE_TEXT, {payload: {
        text
      }}))
    
    const promise = firebase.database().ref('timeEntryInputs/' + uid).update({text})
    promise
    .then((data) => {
      dispatch(actionSuccess(types.TIME_ENTRY_INPUT__CHANGE_TEXT, {payload: {
        text
      }}))
    })
    .catch(() => {
      dispatch(actionFailed(types.TIME_ENTRY_INPUT__CHANGE_TEXT))  
    })

    return promise
  }
}

export const changeStartTime = (uid, date) => {
  return function(dispatch) {
    dispatch(actionStart(types.TIME_ENTRY_INPUT__CHANGE_START_TIME, {'payload': {
      startTime: date
    }}))

    const promise = firebase.database().ref('timeEntryInputs/' + uid).update({startTime: date.getTime()})
    promise
    .then((data) => {
      dispatch(actionSuccess(types.TIME_ENTRY_INPUT__CHANGE_START_TIME, {payload: {
        startTime: date
      }}))
    })
    .catch(() => {
      dispatch(actionFailed(types.TIME_ENTRY_INPUT__CHANGE_START_TIME))  
    })

    return promise
  }
}

export const stop = (uid, text, date) => {
  return function(dispatch) {
    dispatch(actionStart(types.TIME_ENTRY_INPUT__STOP))

    //create complete time entry
    const newEntryRef = firebase.database().ref('timeEntries/' + uid).push()
    const now = new Date()
    const newEntryPromise = newEntryRef.set({
      text: text,
      startTime: date,
      endTime: now.getTime()
    })
    
    //delete current tracking entry
    newEntryPromise.then(function(){
      const deleteEntryPromise = firebase.database().ref('timeEntryInputs/' + uid).remove()
      deleteEntryPromise.then(function(){
        dispatch(actionSuccess(types.TIME_ENTRY_INPUT__STOP))
      })
      .catch(function(){
        dispatch(actionFailed(types.TIME_ENTRY_INPUT__STOP))
      })
    })
    .catch(function(){
      dispatch(actionFailed(types.TIME_ENTRY_INPUT__STOP))
    })
  }
}

//Pull tracking entry from server
export const pull = (uid) => {
  return function(dispatch) {
    dispatch(actionStart(types.TIME_ENTRY_INPUT__PULL))
    
    return new Promise((resolve, reject) => {
      const ref = firebase.database().ref('timeEntryInputs/' + uid)
      ref.once('value', function(snapshot){
        const entry = snapshot.val()
        if (entry) {

          const dispatchSuccess = (entry, tag) => {
            const payload = {
              text: entry.text,
              startTime: entry.startTime
            }
            if (tag) {
              payload.tagName = tag.name
              payload.tagColor = tag.color
            }
            dispatch(actionSuccess(types.TIME_ENTRY_INPUT__PULL, {payload: payload}))
          }

          //entry with tag
          if (entry.tag) {
            const tagRef = firebase.database().ref('tags/' + uid + "/" + entry.tag)
            tagRef.once('value', snapshot => {
              const tag = snapshot.val()
              dispatchSuccess(entry, tag)
            })
          } 
          //entry without tag
          else {
            dispatchSuccess(entry)
          }

        } else {
          dispatch(actionSuccess(types.TIME_ENTRY_INPUT__PULL, {payload: null}))
        }
        resolve()
      })
    })
  }
}

export const start = (uid, text, date) => {
  return function(dispatch) {
    dispatch(actionStart(types.TIME_ENTRY_INPUT__START, {payload: {
        text: text,
        startTime: date
      }}))
    
    const entryData = {
      text: text,
      startTime: date
    }
    const promise = firebase.database().ref('timeEntryInputs/' + uid).set(entryData)
    promise
    .then((data) => {
      dispatch(actionSuccess(types.TIME_ENTRY_INPUT__START, {payload: {
        text: text,
        startTime: date
      }}))
    })
    .catch(() => {
      dispatch(actionFailed(types.TIME_ENTRY_INPUT__START))  
    })

    return promise    
  }
}

export const remove = (uid) => {
  return function(dispatch) {
    dispatch(actionStart(types.TIME_ENTRY_INPUT__REMOVE))
    
    const promise = firebase.database().ref('timeEntryInputs/' + uid).remove()
    promise.then(function(){
      dispatch(actionSuccess(types.TIME_ENTRY_INPUT__REMOVE))
    })
    .catch(function(){
      dispatch(actionFailed(types.TIME_ENTRY_INPUT__REMOVE))
    })
    return promise    
  }
}