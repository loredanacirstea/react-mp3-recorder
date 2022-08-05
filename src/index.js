/**
 * @class Recorder
 */

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'

import vmsg from './vmsg'

import micIcon from './mic-icon-white.svg'
import stopIcon from './stop-icon-white.svg'
import wasmURL from './vmsg.wasm'

import styles from './styles.css'

const shimURL = 'https://unpkg.com/wasm-polyfill.js@0.2.0/wasm-polyfill.js'

export default class Recorder extends Component {
  static propTypes = {
    recorderParams: PropTypes.object,
    onRecordingComplete: PropTypes.func,
    onRecordingError: PropTypes.func,
    className: PropTypes.string,
    pressButtonForRecord: PropTypes.bool,
  }

  static defaultProps = {
    recorderParams: { },
    onRecordingComplete: () => { },
    onRecordingError: () => { },
    pressButtonForRecord: false,
  }

  state = {
    isRecording: false
  }

  _recorder = null

  componentWillUnmount() {
    this._cleanup()
  }

  render() {
    const {
      recorderParams,
      onRecordingComplete,
      onRecordingError,
      className,
      pressButtonForRecord,
      ...rest
    } = this.props;

    const {isRecording} = this.state;

    return (
      <div
        className={classNames(styles.container, className)}
        {...rest}
      >
        {pressButtonForRecord && (
          <div
            className={styles.button}
            onMouseDown={this._onInitRecording}
            onMouseUp={this._onStopRecording}
          >
            <img src={micIcon} width={24} height={24} />
          </div>
        )}
        {!pressButtonForRecord && !isRecording && (
          <div
            className={styles.button}
            onClick={this._onInitRecording}
          >
            <img src={micIcon} width={24} height={24} />
          </div>
        )}
        {!pressButtonForRecord && isRecording && (
          <div
            className={styles.button}
            onClick={this._onStopRecording}
          >
            <img src={stopIcon} width={24} height={24} />
          </div>
        )}
      </div>
    )
  }

  _cleanup() {
    if (this._recorder) {
      this._recorder.stopRecording()
      this._recorder.close()
      delete this._recorder
    }
  }

  _onInitRecording = () => {
    const {
      recorderParams
    } = this.props

    this._cleanup()

    this._recorder = new vmsg.Recorder({
      wasmURL,
      shimURL,
      ...recorderParams
    })

    this._recorder.init()
      .then(() => {
        this._recorder.startRecording()
        this.setState({ isRecording: true })
      })
      .catch((err) => this.props.onRecordingError(err))
  }

  _onStopRecording = () => {
    if (this._recorder) {
      this._recorder.stopRecording()
        .then((blob) => this.props.onRecordingComplete(blob))
        .then(() => this.setState({ isRecording: false }))
        .catch((err) => this.props.onRecordingError(err))
    }
  }
}
