
import './styles/App.css'
import './styles/tokens.css'
import Nav from './components/Nav/Nav'
import CursorTooltip from './components/Tooltip/Tooltip'
import AboutCard from './components/about-card/AboutCard'

function App() {
  return (
    <>
      <Nav />
      <main className="main">
        <div className="grid">
          <div className="grid-slot" style={{ gridArea: '1 / 1 / auto / 3' }}>
            <AboutCard />
          </div>

        </div>
      </main>
      <CursorTooltip />
    </>
  )
}

export default App
