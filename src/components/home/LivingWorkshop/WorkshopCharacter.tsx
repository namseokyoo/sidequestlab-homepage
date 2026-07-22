import characterManifest from '@/data/workshop-character-clip-manifest.json';
import type { WorkshopMotion } from '@/lib/living-workshop/model';
import styles from './LivingWorkshop.module.css';

type WorkshopCharacterProps = {
  motion: WorkshopMotion;
  active: boolean;
};

export default function WorkshopCharacter({
  motion,
  active,
}: WorkshopCharacterProps) {
  const command = characterManifest.commands[motion];

  return (
    <div
      className={styles.characterEnvelope}
      data-character-envelope={JSON.stringify(characterManifest.envelopes.desktop)}
      data-compact-envelope={JSON.stringify(characterManifest.envelopes.compact)}
      data-character-renderer={characterManifest.renderer}
      data-rig-version={characterManifest.rigVersion}
      data-contact-envelope={characterManifest.contactEnvelope}
      data-character-command={motion}
      data-character-sequence={command.sequence.join('>') || 'static'}
      data-clip-duration-ms={command.durationMs}
      data-character-active={active ? 'true' : 'false'}
      data-character-motion={active ? motion : 'static'}
      aria-hidden="true"
    >
      <svg className={styles.character} viewBox="0 0 180 240" role="presentation">
        <defs>
          <linearGradient id="character-stone" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#d8d0c4" />
            <stop offset="0.46" stopColor="#aaa39a" />
            <stop offset="1" stopColor="#706b64" />
          </linearGradient>
          <linearGradient id="character-stone-dark" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#858079" />
            <stop offset="1" stopColor="#4f4c47" />
          </linearGradient>
          <linearGradient id="character-metal" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#f1c18e" />
            <stop offset="0.5" stopColor="#c48a59" />
            <stop offset="1" stopColor="#76513b" />
          </linearGradient>
          <filter id="character-grain" x="-15%" y="-15%" width="130%" height="130%">
            <feTurbulence type="fractalNoise" baseFrequency="0.46" numOctaves="2" seed="17" result="noise" />
            <feColorMatrix
              in="noise"
              type="matrix"
              values="0.14 0 0 0 0.40  0 0.14 0 0 0.38  0 0 0.14 0 0.34  0 0 0 0.22 0"
              result="grain"
            />
            <feBlend in="SourceGraphic" in2="grain" mode="soft-light" />
          </filter>
        </defs>
        <ellipse className={styles.characterShadow} cx="92" cy="225" rx="48" ry="8" />
        <g className={styles.characterRoot} data-part="root" filter="url(#character-grain)">
          <g className={styles.hips} data-part="hips">
            <path className={styles.hipsShape} d="M64 148 L91 141 L117 150 L112 174 L89 181 L67 172 Z" />
            <path className={styles.hipsFacet} d="M64 148 L91 141 L89 181 L67 172 Z" />

            <g className={`${styles.leg} ${styles.leftLeg}`} data-side="left">
              <g className={styles.thigh} data-part="leftThigh">
                <path className={styles.limbStone} d="M68 165 L83 166 L80 194 L69 200 L62 192 Z" />
                <path className={styles.limbFacet} d="M68 165 L75 169 L72 196 L62 192 Z" />
                <circle className={styles.jointStone} cx="73" cy="194" r="6" />
                <g className={styles.shin} data-part="leftShin">
                  <path className={styles.limbStone} d="M66 192 L78 194 L75 217 L62 218 L59 209 Z" />
                  <path className={styles.limbFacet} d="M66 192 L71 196 L68 217 L62 218 L59 209 Z" />
                  <g className={styles.foot} data-part="leftFoot" data-landmark="left-foot">
                    <path className={styles.footStone} d="M61 213 L75 214 L76 224 L48 226 L44 221 Z" />
                    <path className={styles.footFacet} d="M44 221 L61 217 L61 224 L48 226 Z" />
                  </g>
                </g>
              </g>
            </g>

            <g className={`${styles.leg} ${styles.rightLeg}`} data-side="right">
              <g className={styles.thigh} data-part="rightThigh">
                <path className={styles.limbStone} d="M99 166 L114 165 L121 191 L114 199 L104 194 Z" />
                <path className={styles.limbFacet} d="M106 168 L114 165 L121 191 L114 199 Z" />
                <circle className={styles.jointStone} cx="112" cy="194" r="6" />
                <g className={styles.shin} data-part="rightShin">
                  <path className={styles.limbStone} d="M106 193 L119 191 L125 211 L121 219 L108 217 Z" />
                  <path className={styles.limbFacet} d="M113 195 L119 191 L125 211 L121 219 Z" />
                  <g className={styles.foot} data-part="rightFoot" data-landmark="right-foot">
                    <path className={styles.footStone} d="M108 214 L122 213 L141 221 L137 226 L109 224 Z" />
                    <path className={styles.footFacet} d="M122 217 L141 221 L137 226 L121 223 Z" />
                  </g>
                </g>
              </g>
            </g>

            <g className={styles.propSocket} data-socket="prop" data-landmark="prop-socket">
              <path className={styles.carryProp} d="M48 127 L75 121 L88 133 L84 153 L55 158 L44 145 Z" />
            </g>

            <g className={styles.torso} data-part="torso">
              <path className={styles.torsoShell} d="M65 82 L91 72 L116 85 L120 151 L92 170 L59 153 Z" />
              <path className={styles.torsoFacet} d="M91 72 L116 85 L110 146 L92 158 L82 96 Z" />
              <path className={styles.torsoHighlightFacet} d="M65 82 L91 72 L82 96 L59 153 Z" />
              <path className={styles.torsoShadowFacet} d="M59 153 L82 96 L92 158 L92 170 Z" />
              <path className={styles.neckStone} d="M78 72 L88 63 L101 66 L105 79 L91 85 Z" />

              <g className={`${styles.arm} ${styles.leftArm}`} data-side="left">
                <g className={styles.upperArm} data-part="leftUpperArm">
                  <path className={styles.limbStone} d="M62 87 L73 91 L61 119 L51 132 L42 124 L48 105 Z" />
                  <path className={styles.limbFacet} d="M62 87 L67 94 L55 121 L42 124 L48 105 Z" />
                  <circle className={styles.jointStone} cx="50" cy="126" r="7" />
                  <g className={styles.forearm} data-part="leftForearm">
                    <path className={styles.limbStone} d="M43 122 L55 126 L57 149 L50 160 L41 154 L38 137 Z" />
                    <path className={styles.limbFacet} d="M43 122 L49 128 L49 157 L41 154 L38 137 Z" />
                    <g className={styles.hand} data-part="leftHand">
                      <path className={styles.handStone} d="M42 149 L53 147 L59 155 L53 165 L42 163 L37 155 Z" />
                    </g>
                  </g>
                </g>
              </g>

              <g className={`${styles.arm} ${styles.rightArm}`} data-side="right">
                <g className={styles.upperArm} data-part="rightUpperArm">
                  <path className={styles.limbStone} d="M108 87 L119 90 L134 104 L140 121 L134 132 L124 126 L116 111 Z" />
                  <path className={styles.limbFacet} d="M114 90 L119 90 L134 104 L140 121 L134 125 L125 110 Z" />
                  <circle className={styles.jointStone} cx="133" cy="126" r="7" />
                  <g className={styles.forearm} data-part="rightForearm">
                    <path className={styles.limbStone} d="M126 122 L138 121 L145 139 L138 157 L128 160 L124 151 L132 140 Z" />
                    <path className={styles.limbFacet} d="M133 124 L138 121 L145 139 L138 157 L133 152 Z" />
                    <g className={styles.hand} data-part="rightHand">
                      <path className={styles.handStone} d="M126 150 L138 147 L145 154 L140 165 L128 166 L123 158 Z" />
                      <g className={styles.toolSocket} data-socket="tool" data-landmark="tool-socket">
                        <g className={styles.tool}>
                          <path d="M137 154 L150 128" />
                          <path d="M143 123 L162 134" />
                        </g>
                        <g className={styles.lens}>
                          <circle className={styles.lensGlass} cx="149" cy="130" r="14" />
                          <circle cx="149" cy="130" r="14" />
                          <path d="M140 141 L132 155" />
                        </g>
                      </g>
                    </g>
                  </g>
                </g>
              </g>

              <g className={styles.head} data-part="head">
                <polygon className={styles.headStone} points="64,29 84,16 109,22 124,40 122,62 107,79 85,86 65,74 55,55" />
                <polygon className={styles.headFacetLight} points="64,29 84,16 87,48 65,74 55,55" />
                <polygon className={styles.headFacetTop} points="84,16 109,22 103,43 87,48" />
                <polygon className={styles.headFacetMid} points="87,48 103,43 122,62 107,79 85,86" />
                <polygon className={styles.headFacetDark} points="109,22 124,40 122,62 103,43" />
                <polygon className={styles.headFacetWarm} points="65,74 87,48 85,86" />
              </g>
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
}
