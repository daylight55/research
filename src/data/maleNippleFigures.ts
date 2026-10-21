import boxer from '../assets/images/article/male-nipples/boxer-at-rest.jpg'
import adam from '../assets/images/article/male-nipples/tullio-adam.jpg'
import sebastian from '../assets/images/article/male-nipples/saint-sebastian.jpg'
import kannon from '../assets/images/article/male-nipples/kannon-n184.jpg'
import gillot from '../assets/images/male-nipples-gillot.jpg'
import mapplethorpe from '../assets/images/article/male-nipples/mapplethorpe-nipple.jpg'
import mcqueen from '../assets/images/article/male-nipples/cold-breath-still.jpg'
import hebron from '../assets/images/article/male-nipples/hebron-template.jpg'
import takasaki from '../assets/images/article/male-nipples/takasaki-exhibition.png'

// Contemporary works are identified as critical quotations, not openly licensed assets.
// See the article's source notes for the purpose and scope of each reproduction.
const figures = {
	boxer: {
		image: boxer,
		credit: 'Carole Raddato / Wikimedia Commons',
		sourceUrl:
			'https://commons.wikimedia.org/wiki/File:Boxer_of_Quirinal,_Greek_Hellenistic_bronze_sculpture_of_a_sitting_nude_boxer_at_rest,_100-50_BC,_Palazzo_Massimo_alle_Terme,_Rome_(13332767605).jpg',
		rights: 'CC BY-SA 2.0',
		rightsUrl: 'https://creativecommons.org/licenses/by-sa/2.0/',
		ja: {
			alt: '手を重ねて座り、顔を横へ向ける青銅の《休息する拳闘士》。',
			caption:
				'《休息する拳闘士》。胸だけを切り離す前に、傷ついた選手の姿全体を見る。写真の緑青や照明による色も、金属そのものの色とは区別したい。'
		},
		en: {
			alt: 'The bronze Boxer at Rest seated with hands together and head turned.',
			caption:
				'Boxer at Rest. The whole injured athlete provides context for the chest detail. Patina and photographic lighting should be distinguished from the color of the underlying metals.'
		}
	},
	adam: {
		image: adam,
		credit: 'The Metropolitan Museum of Art, Fletcher Fund, 1936 (36.163)',
		sourceUrl: 'https://www.metmuseum.org/art/collection/search/197822',
		rights: 'CC0 / Public Domain',
		rightsUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
		ja: {
			alt: '片手にリンゴを持って立つトゥッリオ・ロンバルド《アダム》の正面像。',
			caption:
				'トゥッリオ・ロンバルド《アダム》（1490～95年頃）。腕、胸、腰の向きと、胸元に当たる光を合わせて見る。'
		},
		en: {
			alt: 'Frontal view of Tullio Lombardo’s standing Adam holding an apple.',
			caption:
				'Tullio Lombardo, Adam, around 1490–95. The positions of the arms, chest, and hips provide context for the light falling across the chest.'
		}
	},
	sebastian: {
		image: sebastian,
		credit: 'The Metropolitan Museum of Art, Circle of Master of the Furies',
		sourceUrl: 'https://www.metmuseum.org/art/collection/search/239276',
		rights: 'CC0 / Public Domain',
		rightsUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
		ja: {
			alt: '腕を上方の木に縛られ、天使を仰ぐ象牙彫刻《聖セバスティアヌス》。',
			caption:
				'《聖セバスティアヌス》（17世紀）。引き伸ばされた胴体と腕、苦しむ顔、上方の天使を同じ画面で見ると、宗教的な物語と裸の身体の造形が重なる。'
		},
		en: {
			alt: 'Ivory Saint Sebastian with arms bound to a tree and an angel above.',
			caption:
				'Saint Sebastian, seventeenth century. The stretched torso and arms, suffering face, and angel above bring the religious narrative and the modeling of a nude body into the same view.'
		}
	},
	kannon: {
		image: kannon,
		credit: 'ColBase / Tokyo National Museum, N-184, image E0043846',
		sourceUrl: 'https://colbase.nich.go.jp/collection_items/tnm/N-184?locale=ja',
		rights: 'CC BY 4.0',
		rightsUrl: 'https://creativecommons.org/licenses/by/4.0/',
		ja: {
			alt: '冠と胸飾りを着け、片手を上げる観音菩薩立像N-184。',
			caption:
				'《観音菩薩立像》（7世紀、東京国立博物館N-184）。胸飾りの下に表された胸と、衣や装身具との関係を確認できる。人物分類や乳頭の意味を、この写真だけから決めるものではない。'
		},
		en: {
			alt: 'Standing Kannon Bosatsu N-184 wearing a crown and chest ornaments, with one hand raised.',
			caption:
				'Standing Kannon Bosatsu, seventh century, Tokyo National Museum N-184. The chest beneath the ornaments can be considered alongside clothing and jewelry. This photograph alone does not establish a gender classification or a meaning for the nipples.'
		}
	},
	gillot: {
		image: gillot,
		credit: 'The Cleveland Museum of Art, Claude Gillot, Seated Male Nude (2008.353)',
		sourceUrl: 'https://www.clevelandart.org/art/2008.353',
		rights: 'CC0',
		rightsUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
		ja: {
			alt: '背中をひねって座る男性の裸体を、赤い線と陰影で描いたクロード・ジローの素描。',
			caption:
				'クロード・ジロー《座る男性裸体》（1693～95年）。全体の構図から胸元の位置を確認する。胸の向きと腕の位置、皮膚の陰影が、モデルを観察する課題として一緒に描かれている。'
		},
		en: {
			alt: 'Claude Gillot’s red-chalk study of a seated nude man twisting his torso.',
			caption:
				'Claude Gillot, Seated Male Nude, 1693–95, shown with its full composition. Chest orientation, arm position, and skin shading belong to the same task of observing a model.'
		}
	},
	mapplethorpe: {
		image: mapplethorpe,
		credit: 'Robert Mapplethorpe, Nipple, 1988 / Robert Mapplethorpe Foundation',
		sourceUrl: 'https://www.mapplethorpe.org/exhibitions/xavier-hufkens',
		imageLink: 'https://www.mapplethorpe.org/exhibitions/xavier-hufkens',
		rights: '© Robert Mapplethorpe Foundation',
		quotation: true,
		ja: {
			alt: '胸の一部と乳首を切り取った、ロバート・メイプルソープ《Nipple》の白黒写真。',
			caption:
				'ロバート・メイプルソープ《Nipple》（1988年、図版引用）。顔や全身を外した構図と、皮膚の細かな質感を見るために示す。胸の一部が一枚の画面を占めること自体が、本文で扱う切り取り方である。'
		},
		en: {
			alt: 'Robert Mapplethorpe’s black-and-white Nipple, isolating a nipple and surrounding chest.',
			caption:
				'Robert Mapplethorpe, Nipple, 1988, quoted for visual discussion. Excluding the face and whole figure directs attention to framing and skin texture. The body fragment filling the photograph is the compositional choice discussed in the text.'
		}
	},
	mcqueen: {
		image: mcqueen,
		credit:
			'Steve McQueen, Cold Breath, 1999. Courtesy of the artist and Rat Hole Gallery / ART iT',
		sourceUrl: 'https://www.art-it.asia/u/admin_ed_pics/hnrp9u0mpnsxzdai8kw7/',
		imageLink: 'https://www.art-it.asia/u/admin_ed_pics/hnrp9u0mpnsxzdai8kw7/',
		rights: '© Steve McQueen',
		quotation: true,
		ja: {
			alt: '指が乳首に触れる、スティーヴ・マックイーン《Cold Breath》の白黒の静止画。',
			caption:
				'スティーヴ・マックイーン《Cold Breath》（1999年、フィルム・スティルの図版引用）。指と皮膚が画面を占める距離感を確認するための一場面。接触の反復や10分という長さは、静止画だけでは伝わらない。'
		},
		en: {
			alt: 'A black-and-white still from Steve McQueen’s Cold Breath showing a finger touching a nipple.',
			caption:
				'Steve McQueen, Cold Breath, 1999, a film still quoted to show how closely finger and skin fill the frame. A single still cannot convey the repeated contact or ten-minute duration.'
		}
	},
	hebron: {
		image: hebron,
		credit: 'Micol Hebron, male nipple template / Chapman University Newsroom, 2015',
		sourceUrl:
			'https://news.chapman.edu/2015/07/22/male-nipple-template-to-freethenipple-and-micol-hebron-go-viral/',
		imageLink:
			'https://news.chapman.edu/2015/07/22/male-nipple-template-to-freethenipple-and-micol-hebron-go-viral/',
		rights: '© Micol Hebron; image published by Chapman University',
		quotation: true,
		ja: {
			alt: '切り貼り用の男性乳首と、男性の乳首で女性の乳首を覆うよう促す英文を組み合わせたテンプレート。',
			caption:
				'ミコル・ヘブロンのテンプレートを紹介する2015年の記事掲載図版（引用）。切り抜く形と「男性の乳首ならよい」という文言を同じ画面で見ると、当時の規則の論理を使った仕掛けがわかる。現在の投稿可否を示すものではない。'
		},
		en: {
			alt: 'A cut-and-paste male nipple template with text proposing male nipples as covers for female nipples.',
			caption:
				'The template graphic published in Chapman’s 2015 account of Micol Hebron’s project, quoted for discussion. The cut-out shape and wording expose the project’s use of the rules’ gender distinction at that time. It does not establish what platforms permit today.'
		}
	},
	takasaki: {
		image: takasaki,
		credit: 'Shohei Takasaki, sun, snake, nipples, 2020. Photo by Shin Hamada / Bijutsu Techo',
		sourceUrl: 'https://bijutsutecho.com/magazine/interview/22519',
		imageLink: 'https://bijutsutecho.com/magazine/interview/22519',
		rights: '© Shohei Takasaki; photo: Shin Hamada',
		quotation: true,
		ja: {
			alt: 'Shohei Takasaki展の白い壁に、小さな素描と円形のモチーフを含む色彩的な絵画が並ぶ展示風景。',
			caption:
				'《sun, snake, nipples》（2020年）の展示風景を引用。小さな素描と絵画が並ぶ空間を示す。これは「おたまを掛ける案」の実物を写した写真ではなく、用途を考える企画がどのような展示になったかを見る資料である。'
		},
		en: {
			alt: 'Small drawings and colorful paintings with circular motifs arranged on a white wall in Shohei Takasaki’s exhibition.',
			caption:
				'An installation view of sun, snake, nipples, 2020, quoted to show the small drawings alongside paintings. This is not a photograph of an actual ladle-hanging device; it shows the exhibition context in which the proposals about use appeared.'
		}
	}
}

type FigureKey = keyof typeof figures
export function artFigure(key: FigureKey, locale: 'ja' | 'en') {
	const { ja, en, ...shared } = figures[key]
	return { ...shared, ...(locale === 'en' ? en : ja), locale }
}

export function artDetail(key: 'boxer' | 'adam', locale: 'ja' | 'en') {
	const details = {
		boxer: {
			position: '50% 34%',
			ja: {
				alt: '《休息する拳闘士》の胸元を表示上で拡大した写真。',
				caption:
					'同じ写真の胸元を拡大表示。乳首の位置と周囲の金属の違いを追う。色の見え方には緑青と撮影時の光も影響する。表示範囲を切り出したもので、元画像の色は変えていない。'
			},
			en: {
				alt: 'An enlarged display of the Boxer at Rest’s chest from the same photograph.',
				caption:
					'The chest enlarged from the same photograph to locate the nipples against the surrounding metal. Patina and lighting also affect the visible color. This is a cropped display with no recoloring of the source image.'
			}
		},
		adam: {
			position: '50% 23%',
			ja: {
				alt: '《アダム》の左右の乳首と胸の輪郭を見比べるための胸元の拡大表示。',
				caption:
					'同じ写真の胸元を拡大表示。画面左が像自身の右、画面右が像自身の左。形と光を見比べる入口になるが、この正面写真だけで側面の輪郭や作者の意図まで証明できるわけではない。'
			},
			en: {
				alt: 'An enlarged display of Adam’s chest for comparing the two nipples and the chest contour.',
				caption:
					'The chest enlarged from the same photograph. The statue’s own right is on the image’s left, and its left is on the image’s right. This frontal view supports looking at form and light; it does not alone establish the side contour or the artist’s intention.'
			}
		}
	}[key]
	return { ...artFigure(key, locale), ...details[locale], detail: true, position: details.position }
}
