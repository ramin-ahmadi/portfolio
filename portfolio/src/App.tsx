
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
import DesignSystem from './components/Cards/DesignSystem/DesignSystem'
import AgenticDesignSystem from './components/Cards/AgenticDesignSystem/AgenticDesignSystem'
import Libra from './components/Cards/Libra/Libra'
import Quote from './components/Cards/quote/Quote'
import QuoteUX from './components/Cards/QuoteUX/QuoteUX'

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
          <div className="grid-slot" style={{ gridArea: '3 / 1 / 5 / 3' }}>
            <DesignSystem />
          </div>
          <div className="grid-slot" style={{ gridArea: '4 / 3 / 6' }}>
            <AgenticDesignSystem />
          </div>
          <div className="grid-slot" style={{ gridArea: '4 / 4 / 6 / 5' }}>
            <Libra />
          </div>
          <div className="grid-slot" style={{ gridArea: '5 / 1 / auto / 3' }}>
            <Quote />
          </div>
          <div className="grid-slot" style={{ gridArea: '6 / 3 / auto / 5' }}>
            <QuoteUX />
          </div>

        </div>
      </main>
      <CursorTooltip />
    </>
  )
}

export default App
