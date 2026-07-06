
import './styles/App.css'
import './styles/tokens.css'
import Nav from './components/Nav/Nav'
import CursorTooltip from './components/Tooltip/Tooltip'
import AboutCard from './components/Cards/AboutCard/AboutCard'
import GmailCard from './components/Cards/GmailCard/GmailCard'
import LinkedinCard from './components/Cards/LinkedinCard/LinkedinCard'
import BulbCard from './components/Cards/BulbCard/BulbCard'
import DuolingoCard from './components/Cards/DuolingoCard/DuolingoCard'
import ModularSofa from './components/Cards/modular-sofa/ModularSofa'

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
          <div className="grid-slot" style={{ gridArea: '2 / 1' }}>
            <BulbCard />
          </div>
          <div className="grid-slot" style={{ gridArea: '2 / 2' }}>
            <DuolingoCard />
          </div>
          <div className="grid-slot" style={{ gridArea: '2 / 3 / 4 / 5' }}>
            <ModularSofa />
          </div>

        </div>
      </main>
      <CursorTooltip />
    </>
  )
}

export default App
