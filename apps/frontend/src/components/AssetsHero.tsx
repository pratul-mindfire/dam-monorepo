import { ASSET_TEXT } from '@/constants'

type AssetsHeroProps = {
  currentPage: number
  totalAssets: number
  totalPages: number
  visibleAssets: number
}

const AssetsHero = ({ currentPage, totalAssets, totalPages, visibleAssets }: AssetsHeroProps) => {
  return (
    <section className="assets-hero">
      <div>
        <p className="assets-kicker">{ASSET_TEXT.heroKicker}</p>
        <h1>{ASSET_TEXT.heroTitle}</h1>
        <p className="assets-subtitle">{ASSET_TEXT.heroSubtitle}</p>
      </div>

      <div className="assets-hero-stats">
        <div className="asset-stat-card">
          <span>{ASSET_TEXT.statsMatching}</span>
          <strong>{totalAssets}</strong>
        </div>
        <div className="asset-stat-card">
          <span>{ASSET_TEXT.statsVisible}</span>
          <strong>{visibleAssets}</strong>
        </div>
        <div className="asset-stat-card">
          <span>{ASSET_TEXT.statsPage}</span>
          <strong>{totalPages === 0 ? 0 : currentPage}</strong>
        </div>
      </div>
    </section>
  )
}

export default AssetsHero
