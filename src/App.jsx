import SendPdfForm from "./components/SendPdfForm.jsx";
import './App.css'; // Optional: for basic styling

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>LevelUP Report Sender</h1>
        <SendPdfForm />
      </header>
    </div>
  );
}

// Simple CSS for centering. Create a file 'src/App.css' if it doesn't exist.
// You can remove this or style it however you like.
const styles = `
.App {
  text-align: center;
}
.App-header {
  background-color: #282c34;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: calc(10px + 2vmin);
  color: white;
}
`;
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);


export default App;