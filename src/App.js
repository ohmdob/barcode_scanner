import React, { Component } from 'react';
import Quagga  from 'quagga';
import logo from './logo.svg';
import './App.css';

class App extends Component {

  constructor() {
    super()

    this.state = {
      codes: [],
      scannerActive: false,
      canvas: {},
      context: {},
      video: {},
      imageUrls: [],
    }

    this.onDetectedHandler = this.onDetectedHandler.bind(this)
    this.startScanning = this.startScanning.bind(this)
    this.stopScanning = this.stopScanning.bind(this)
    this.captureImage = this.captureImage.bind(this)
  }

  componentDidMount() {
    this.startScanning();
  }

  quaggaInitCallback(err) {

      if (err) {
          console.log(err);
          return
      }

      Quagga.onDetected(this.onDetectedHandler)

      console.log("Initialization finished. Ready to start");

      Quagga.start()

      this.setState({
        canvas: document.querySelector('.input-stream canvas'),
      })

      this.setState({
        context: this.state.canvas.getContext('2d'),
        video: document.querySelector('.input-stream video'),
      })
  }

  // display alert if a barcode is scanned a second time.
  displayDuplicateAlert() {
    window.alert('You have already scanned this barcode.')
  }

    console.log('onDetectedHandler()')
  // destructure argument into the information we need, to avoid imperative variable declarations with all the usual verbose validity checks.
  onDetectedHandler({codeResult}) {
    Quagga.offDetected()
    this.captureImage()

    // check if the code is already in state, and alert if it is, or add to state if not.
    this.state.codes.includes(codeResult.code)
      ? this.displayDuplicateAlert()
      : (() => {
        this.addDetectedCode(codeResult.code)
    })()

    setTimeout(Quagga.onDetected(this.onDetectedHandler), 1000)

  }

  captureImage() {
    this.state.context.drawImage(this.state.video, 0, 0, this.state.canvas.width, this.state.canvas.height)
    this.state.canvas.toBlob(blob => {
      const url = URL.createObjectURL(blob)
      console.log('url: ', url)
      this.setState({
        imageUrls: [...this.state.imageUrls, url]
      })
      this.state.context.clearRect(0, 0, this.state.canvas.width, this.state.canvas.height);
    })
  }

  addDetectedCode(code) {
    this.setState({
      codes: [...this.state.codes, code]
    })
  }

  stopScanning() {
    Quagga.stop()
  }

  startScanning () {

    this.setState({
        scannerActive: true
    })

    Quagga.init({
      inputStream : {
        name : "Barcode Scanner",
        type : "LiveStream",
        target: document.querySelector('.input-stream'),
        constraints: {
          width: 640,
          height: 240,
        },
      },
      decoder : {
        readers : ["code_128_reader"],
        multiple : false,
      },
      locate : true,
    },
    this.quaggaInitCallback.bind(this));
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title"> Barcode Scanner</h1>
          <img src={logo} className="App-logo" alt="logo" />
        </header>
        <ul className="codes">
        {this.state.codes.map((v, i) => {
          return (<li key={i}>{v}</li>)
        })}
        </ul>
        <button onClick={this.startScanning}>Scan</button>
        <div className="input-stream"></div>
        <button onClick={this.stopScanning}>Cancel</button>
        <div>Barcode Images</div>
        <ul className="barcodeImages">
          {
            this.state.imageUrls.map((v, i) => {
              return (<li key={i}><img src={v}/></li>)
            })
          }
        </ul>
      </div>
    );
  }
}

export default App
