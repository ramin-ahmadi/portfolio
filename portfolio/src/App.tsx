
import './styles/App.css'
import './styles/tokens.css'
import Nav from './components/Nav/Nav'
import CursorTooltip from './components/Tooltip/Tooltip'
import AboutCard from './components/Cards/AboutCard/AboutCard'
import GmailCard from './components/Cards/GmailCard/GmailCard'
import LinkedinCard from './components/Cards/LinkedinCard/LinkedinCard'

function App() {
  return (
    <>
    <div className="cs-root" >
       </div>
      <Nav />
      <main className="main">
        <div className="grid">
          <div className="grid-slot" style={{ gridArea: '1 / 1 / auto / 3' }}>
            <AboutCard/>
          </div>
          <div className="grid-slot" style={{ gridArea: '1 / 3' }}>
            <GmailCard/>
          </div>
           <div className="grid-slot" style={{ gridArea: '1 / 4' }}>
            <LinkedinCard/>
          </div>
        </div>
      </main>
      <CursorTooltip />
    </>
  )
}

export default App
