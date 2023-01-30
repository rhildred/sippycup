/** @jsxImportSource @emotion/react */
import { React, useState } from "react";
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import TabbedEditor from "./TabbedEditor";
import Console from "./Console";
import { src } from './init';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from "@mui/material/CssBaseline";
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import MockBrowser from "./MockBrowser";

// output window
// import PublicIcon from '@mui/icons-material/Public';
// import Tab from '@mui/material/Tab';
// import Typography from "@mui/material/Typography";
// import TextField from '@mui/material/TextField';
// import Input from '@mui/material/Input';
// import RefreshIcon from '@mui/icons-material/Refresh';


const sippycup = new Worker(new URL('./sippycup.js', import.meta.url));


const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

function App() {
  const [stdout, updateStdout] = useState('Python loading...\n');
  const [pythonSrc, updatePythonSrc] = useState(src.python);
  const [htmlSrc, updateHtmlSrc] = useState(src.html);
  const [cssSrc, updateCssSrc] = useState(src.css);
  const [htmlOutput, updateHtmlOutput] = useState('');

  let serverRunning = false
  
  function runCode(code) {
    console.log('runCode called')
    sippycup.postMessage({command:"updateFile", filename:"index.html", content:htmlSrc})
    sippycup.postMessage({command:"updateFile", filename:"style.css", content:cssSrc})
    sippycup.postMessage({command:"run", src: pythonSrc})
  }
  
  function request(method, route) {
    if (serverRunning) {
      sippycup.postMessage({command:"request", method:method, route:route})
    }
  }
  

  sippycup.addEventListener("message", function handleMessage(msg) {
    if (msg.data.command === "ready") {
        // let runButton = document.querySelector('#run')
        // // runButton.innerText = "Run";
        // // runButton.removeAttribute('disabled')
  
        // let codeArea = document.querySelector('#code-input')
        
  
        // runButton.addEventListener('click', function(event) {
        //     console.log('click')
        //     console.log(codeArea.value)
        //     sippycup.postMessage({'src':codeArea.value})
        // })
    }
    if (msg.data.command === "response") {
      updateHtmlOutput(msg.data.data.replace(/\\n/g, '\n'))
    }
  
    if (msg.data.command === "stdout") {
      console.log("STDOUT: ", msg.data.message)
      updateStdout(stdout + msg.data.message + '\n')
    }

    if (msg.data.command === "appReady") {
      serverRunning = true
    }
  })


  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Grid container height="100vh">
        <Grid item xs={6} sx={{display:'flex', flexDirection:'column', padding: '15px'}}>
          <Stack sx={{border: 'solid 1px #444', borderRadius: '15px'}}>
            <Box>
              <TabbedEditor runHandler = { runCode } 
                files={[
                {
                  name:'app.py',
                  language:'python',
                  src: pythonSrc,
                  changeHandler: updatePythonSrc
                },
                {
                  name:'index.html',
                  language:'html',
                  src: htmlSrc,
                  changeHandler: updateHtmlSrc
                },
                {
                  name:'style.css',
                  language:'css',
                  src: cssSrc,
                  changeHandler: updateCssSrc
                },
                
              ]}/>
            </Box>
            {/* <Grid container justifyContent="flex-end">
              <Button onClick={runCode}><PlayArrowIcon />Run</Button>
            </Grid> */}
            <Box sx={{height:'44vh', borderTop: "solid 1px #444"}}>
              <Console content={ stdout } initialContent={"Python loading..."}></Console>
            </Box>
          </Stack>
          
        </Grid>        
        <Grid item xs={6} height="95vh">
          <MockBrowser src={ htmlOutput }></MockBrowser>
        </Grid>
      </Grid>
    </ThemeProvider>
  );
}

export default App;
