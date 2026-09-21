import React from 'react'
import { Heart } from 'lucide-react'

export function StoryBlock({ wedding, config = {}, lang = 'km' }) {
  const isKhmer = lang === 'km'
  const primaryColor = config.primaryColor || '#C59B27'
  const fontHeading = config.fontHeading === 'serif' ? 'font-serif' : 'font-moul'

  return (
    <section className="py-12 md:py-16 px-4">
      <div className="max-w-xl mx-auto space-y-10">
        {/* Parents Announcement Section */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gold-200/60 shadow-card text-center space-y-6">
          <div className="space-y-1">
            <h3
              className={`text-lg sm:text-xl leading-relaxed ${fontHeading}`}
              style={{ color: primaryColor }}
            >
              {isKhmer ? 'សេចក្តីគោរពអញ្ជើញពីមាតាបិតាទាំងសងខាង' : 'With Blessings from Parents'}
            </h3>
            <p className="text-xs text-charcoal-500 font-serif tracking-wider uppercase">
              {isKhmer ? 'មង្គលការកូនប្រុស កូនស្រី' : 'Celebration of Union'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 border-t border-cream-200/80">
            {/* Groom's Parents */}
            <div className="space-y-1.5 p-3 rounded-2xl bg-cream-50/60 border border-gold-100">
              <span className="text-xs font-bold text-gold-700 font-ui uppercase">
                {isKhmer ? 'ខាងកូនកំលោះ' : "Groom's Side"}
              </span>
              <p className="text-sm font-semibold text-charcoal-900 font-ui">
                {wedding?.groom_father_kh || 'ឪពុកកូនកំលោះ'}
              </p>
              <p className="text-sm font-semibold text-charcoal-900 font-ui">
                {wedding?.groom_mother_kh || 'ម្តាយកូនកំលោះ'}
              </p>
            </div>

            {/* Bride's Parents */}
            <div className="space-y-1.5 p-3 rounded-2xl bg-cream-50/60 border border-gold-100">
              <span className="text-xs font-bold text-gold-700 font-ui uppercase">
                {isKhmer ? 'ខាងកូនក្រមុំ' : "Bride's Side"}
              </span>
              <p className="text-sm font-semibold text-charcoal-900 font-ui">
                {wedding?.bride_father_kh || 'ឪពុកកូនក្រមុំ'}
              </p>
              <p className="text-sm font-semibold text-charcoal-900 font-ui">
                {wedding?.bride_mother_kh || 'ម្តាយកូនក្រមុំ'}
              </p>
            </div>
          </div>
        </div>

        {/* Love Story Section */}
        {wedding?.story && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gold-200/60 shadow-card text-center space-y-4">
            <div className="w-8 h-8 rounded-full bg-gold-100 flex items-center justify-center text-gold-600 mx-auto">
              <Heart className="w-4 h-4 fill-current" />
            </div>

            <h3
              className={`text-lg sm:text-xl leading-relaxed ${fontHeading}`}
              style={{ color: primaryColor }}
            >
              {isKhmer ? 'ដំណើររឿងនៃក្តីស្រឡាញ់' : 'Our Love Story'}
            </h3>

            <p className="text-sm sm:text-base text-charcoal-700 font-ui leading-relaxed max-w-lg mx-auto whitespace-pre-line">
              {wedding.story}
            </p>
          </div>
        )}
      </div>
    </section>
  )
}

export default StoryBlock
