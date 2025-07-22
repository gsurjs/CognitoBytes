class WoordleGame {
    constructor() {
        this.wordLength = 5;
        this.maxAttempts = 6;
        this.currentRow = 0;
        this.currentCol = 0;
        this.gameActive = true;
        this.currentWord = '';
        this.targetWord = '';
        this.gameMode = 'daily';
        this.keyboardState = {};
        
        // Word lists
        this.commonWords = [
            'AAHED', 'AALII', 'AARGH', 'ABACA', 'ABACI', 'ABACK', 'ABAFT', 'ABAKA', 'ABAMP', 'ABASE',
            'ABASH', 'ABATE', 'ABAYA', 'ABBAS', 'ABBED', 'ABBES', 'ABBEY', 'ABBOT', 'ABCEE', 'ABEAM',
            'ABEAR', 'ABELE', 'ABETS', 'ABHOR', 'ABIDE', 'ABIES', 'ABLED', 'ABLER', 'ABLES', 'ABLET',
            'ABLOW', 'ABMHO', 'ABODE', 'ABOHM', 'ABOIL', 'ABOMA', 'ABOON', 'ABORT', 'ABOUT', 'ABOVE',
            'ABRAM', 'ABRAY', 'ABRIM', 'ABRIN', 'ABRIS', 'ABRUS', 'ABSEY', 'ABSIT', 'ABUNA', 'ABUSE',
            'ABUTS', 'ABUZZ', 'ABYES', 'ABYSM', 'ABYSS', 'ACAIS', 'ACARI', 'ACCAS', 'ACCOY', 'ACERB',
            'ACERS', 'ACETA', 'ACHAR', 'ACHED', 'ACHES', 'ACHOO', 'ACIDS', 'ACIDY', 'ACING', 'ACINI',
            'ACKEE', 'ACKER', 'ACMES', 'ACMIC', 'ACNED', 'ACNES', 'ACOCK', 'ACOLD', 'ACORN', 'ACRED',
            'ACRES', 'ACRID', 'ACTED', 'ACTIN', 'ACTOR', 'ACUTE', 'ACYLS', 'ADAGE', 'ADAPT', 'ADAWS',
            'ADAYS', 'ADDAX', 'ADDED', 'ADDER', 'ADDIO', 'ADDLE', 'ADEEM', 'ADEPT', 'ADHAN', 'ADIEU',
            'ADIOS', 'ADITS', 'ADMAN', 'ADMEN', 'ADMIN', 'ADMIT', 'ADMIX', 'ADOBE', 'ADOBO', 'ADOPT',
            'ADORE', 'ADORN', 'ADOWN', 'ADOZE', 'ADRAD', 'ADRED', 'ADSUM', 'ADULT', 'ADUNC', 'ADUST',
            'ADVEW', 'ADYTA', 'ADZED', 'ADZES', 'AECIA', 'AEDES', 'AEGIS', 'AEONS', 'AERIE', 'AEROS',
            'AESIR', 'AFALD', 'AFARA', 'AFARS', 'AFEAR', 'AFFIX', 'AFIRE', 'AFLAJ', 'AFOAM', 'AFORE',
            'AFOUL', 'AFRIT', 'AFROS', 'AFTER', 'AGAIN', 'AGAMA', 'AGAMI', 'AGAPE', 'AGARS', 'AGAST',
            'AGATE', 'AGAVE', 'AGAZE', 'AGENE', 'AGENT', 'AGERS', 'AGGER', 'AGGIE', 'AGGRI', 'AGGRO',
            'AGGRY', 'AGHAS', 'AGILA', 'AGILE', 'AGING', 'AGIOS', 'AGISM', 'AGIST', 'AGITA', 'AGLEE',
            'AGLET', 'AGLEY', 'AGLOO', 'AGLOW', 'AGMAS', 'AGOGE', 'AGONE', 'AGONS', 'AGONY', 'AGOOD',
            'AGORA', 'AGREE', 'AGRIA', 'AGRIN', 'AGROS', 'AGUED', 'AGUES', 'AGUTI', 'AHEAD', 'AHEAP',
            'AHENT', 'AHIGH', 'AHIND', 'AHING', 'AHINT', 'AHOLD', 'AHULL', 'AHURU', 'AIDED', 'AIDER',
            'AIDES', 'AIDOI', 'AIDOS', 'AIERY', 'AIGAS', 'AIGHT', 'AILED', 'AIMED', 'AIMER', 'AINEE',
            'AINGA', 'AIOLI', 'AIRED', 'AIRER', 'AIRNS', 'AIRTH', 'AIRTS', 'AISLE', 'AITCH', 'AITUS',
            'AIVER', 'AIYEE', 'AIZLE', 'AJAPA', 'AJIVA', 'AJUGA', 'AJWAN', 'AKEES', 'AKELA', 'AKENE',
            'AKING', 'AKITA', 'AKKAS', 'ALAAP', 'ALACK', 'ALAMO', 'ALAND', 'ALANE', 'ALANG', 'ALANS',
            'ALANT', 'ALAPA', 'ALAPS', 'ALARM', 'ALARY', 'ALATE', 'ALAYS', 'ALBAS', 'ALBEE', 'ALBUM',
            'ALCID', 'ALDER', 'ALDOL', 'ALECK', 'ALECS', 'ALEFS', 'ALEPH', 'ALERT', 'ALEWS', 'ALEYE',
            'ALFAS', 'ALGAE', 'ALGAL', 'ALGAS', 'ALGID', 'ALGIN', 'ALGOR', 'ALGUM', 'ALIAS', 'ALIBI',
            'ALIEN', 'ALIFS', 'ALIGN', 'ALIKE', 'ALINE', 'ALIST', 'ALIVE', 'ALIYA', 'ALKIE', 'ALKOS',
            'ALKYD', 'ALKYL', 'ALLAY', 'ALLEE', 'ALLEL', 'ALLEY', 'ALLIS', 'ALLOD', 'ALLOT', 'ALLOW',
            'ALLOY', 'ALLYL', 'ALMAH', 'ALMAS', 'ALMEH', 'ALMES', 'ALMUD', 'ALMUG', 'ALODS', 'ALOED',
            'ALOES', 'ALOFT', 'ALOHA', 'ALOIN', 'ALONE', 'ALONG', 'ALOOF', 'ALOOS', 'ALOUD', 'ALOWE',
            'ALPAS', 'ALPHA', 'ALTAR', 'ALTER', 'ALTHO', 'ALTOS', 'ALULA', 'ALUMS', 'ALURE', 'ALVAR',
            'ALWAY', 'AMAHS', 'AMAIN', 'AMASS', 'AMATE', 'AMAUT', 'AMAZE', 'AMBAN', 'AMBER', 'AMBIT',
            'AMBLE', 'AMBOS', 'AMBRY', 'AMEBA', 'AMEER', 'AMEND', 'AMENE', 'AMENT', 'AMIAS', 'AMICE',
            'AMICI', 'AMIDE', 'AMIDO', 'AMIDS', 'AMIES', 'AMIGA', 'AMIGO', 'AMINE', 'AMINO', 'AMINS',
            'AMIRS', 'AMISS', 'AMITY', 'AMLAS', 'AMMAN', 'AMMON', 'AMMOS', 'AMNIA', 'AMNIC', 'AMNIO',
            'AMOKS', 'AMOLE', 'AMONG', 'AMORT', 'AMOUR', 'AMOVE', 'AMOWT', 'AMPED', 'AMPLE', 'AMPLY',
            'AMPUL', 'AMRIT', 'AMUCK', 'AMUSE', 'AMYLS', 'ANANA', 'ANATA', 'ANCHO', 'ANCLE', 'ANCON',
            'ANDED', 'ANDES', 'ANEAR', 'ANELE', 'ANENT', 'ANGAS', 'ANGEL', 'ANGER', 'ANGLE', 'ANGLO',
            'ANGRY', 'ANGST', 'ANIGH', 'ANILE', 'ANILS', 'ANIMA', 'ANIME', 'ANIMI', 'ANION', 'ANISE',
            'ANKER', 'ANKLE', 'ANLAS', 'ANNAL', 'ANNAS', 'ANNAT', 'ANNEX', 'ANNOY', 'ANNUL', 'ANOAS',
            'ANODE', 'ANOLE', 'ANOMY', 'ANSAE', 'ANTAE', 'ANTAR', 'ANTAS', 'ANTED', 'ANTES', 'ANTIC',
            'ANTIS', 'ANTRA', 'ANTRE', 'ANTSY', 'ANURA', 'ANVIL', 'ANYON', 'AORTA', 'APACE', 'APAGE',
            'APAID', 'APART', 'APAYD', 'APAYS', 'APEAK', 'APEEK', 'APERS', 'APERT', 'APERY', 'APGAR',
            'APHID', 'APHIS', 'APIAN', 'APING', 'APIOL', 'APISH', 'APISM', 'APNEA', 'APODE', 'APODS',
            'APOOP', 'APORT', 'APPAL', 'APPAY', 'APPLE', 'APPLY', 'APPRO', 'APPUI', 'APPUY', 'APRES',
            'APRON', 'APSES', 'APSIS', 'APSOS', 'APTER', 'APTLY', 'AQUAE', 'AQUAS', 'ARABA', 'ARAKS',
            'ARAME', 'ARARS', 'ARBAS', 'ARBOR', 'ARCED', 'ARCHI', 'ARCOS', 'ARCUS', 'ARDEB', 'ARDOR',
            'ARDRI', 'AREAD', 'AREAE', 'AREAL', 'AREAR', 'AREAS', 'ARECA', 'AREDD', 'AREDE', 'AREFY',
            'AREIC', 'ARENA', 'ARENE', 'AREPA', 'ARERE', 'ARETE', 'ARETS', 'ARETT', 'ARGAL', 'ARGAN',
            'ARGIL', 'ARGLE', 'ARGOL', 'ARGON', 'ARGOT', 'ARGUE', 'ARGUS', 'ARHAT', 'ARIAS', 'ARIEL',
            'ARIKI', 'ARILS', 'ARIOT', 'ARISE', 'ARISH', 'ARKED', 'ARLED', 'ARLES', 'ARMED', 'ARMER',
            'ARMET', 'ARMIL', 'ARMOR', 'ARNAS', 'ARNUT', 'AROBA', 'AROHA', 'AROID', 'AROMA', 'AROSE',
            'ARPAS', 'ARPEN', 'ARRAH', 'ARRAS', 'ARRAY', 'ARRET', 'ARRIS', 'ARROW', 'ARROZ', 'ARSED',
            'ARSES', 'ARSEY', 'ARSIS', 'ARSON', 'ARTAL', 'ARTEL', 'ARTIC', 'ARTIS', 'ARTSY', 'ARUHE',
            'ARUMS', 'ARVAL', 'ARVOS', 'ARYLS', 'ASANA', 'ASCON', 'ASCOT', 'ASCUS', 'ASDIC', 'ASHED',
            'ASHEN', 'ASHES', 'ASHET', 'ASIDE', 'ASKED', 'ASKER', 'ASKEW', 'ASKOI', 'ASKOS', 'ASPEN',
            'ASPER', 'ASPIC', 'ASPIS', 'ASPRO', 'ASSAI', 'ASSAM', 'ASSAY', 'ASSES', 'ASSET', 'ASSEZ',
            'ASSOT', 'ASTER', 'ASTIR', 'ASURA', 'ASWIM', 'ASYLA', 'ATAPS', 'ATAXY', 'ATIGI', 'ATILT',
            'ATIMY', 'ATLAS', 'ATMAN', 'ATMAS', 'ATMOS', 'ATOCS', 'ATOKE', 'ATOKS', 'ATOLL', 'ATOMS',
            'ATOMY', 'ATONE', 'ATONY', 'ATOPY', 'ATRIA', 'ATRIP', 'ATTAP', 'ATTAR', 'ATTIC', 'ATUAS',
            'AUDAD', 'AUDIO', 'AUDIT', 'AUGER', 'AUGHT', 'AUGUR', 'AULAS', 'AULIC', 'AULOI', 'AULOS',
            'AUMIL', 'AUNES', 'AUNTS', 'AUNTY', 'AURAE', 'AURAL', 'AURAR', 'AURAS', 'AUREI', 'AURES',
            'AURIC', 'AURIS', 'AURUM', 'AUTOS', 'AUXIN', 'AVAIL', 'AVALE', 'AVANT', 'AVAST', 'AVELS',
            'AVENS', 'AVERS', 'AVERT', 'AVGAS', 'AVIAN', 'AVINE', 'AVION', 'AVISE', 'AVISO', 'AVIZE',
            'AVOID', 'AVOUE', 'AVOWS', 'AVYZE', 'AWAIT', 'AWAKE', 'AWARD', 'AWARE', 'AWARN', 'AWASH',
            'AWATO', 'AWAVE', 'AWAYS', 'AWDLS', 'AWEEL', 'AWETO', 'AWFUL', 'AWHED', 'AWHIL', 'AWING',
            'AWMRY', 'AWNED', 'AWNER', 'AWOKE', 'AWOLS', 'AWORK', 'AXELS', 'AXIAL', 'AXILE', 'AXILS',
            'AXING', 'AXIOM', 'AXION', 'AXITE', 'AXLED', 'AXLES', 'AXMAN', 'AXMEN', 'AXOID', 'AXONE',
            'AXONS', 'AYAHS', 'AYAYA', 'AYELP', 'AYINS', 'AYONT', 'AYRES', 'AYRIE', 'AZANS', 'AZIDE',
            'AZIDO', 'AZINE', 'AZLON', 'AZOIC', 'AZOLE', 'AZONS', 'AZOTE', 'AZOTH', 'AZUKI', 'AZURE',
            'AZURN', 'AZURY', 'AZYGY', 'AZYME', 'AZYMS',
            
            // B words
            'BAAED', 'BAALS', 'BABAS', 'BABEL', 'BABES', 'BABKA', 'BABOO', 'BABUL', 'BABUS', 'BACCA',
            'BACCO', 'BACCY', 'BACHA', 'BACHS', 'BACKS', 'BACON', 'BADDY', 'BADGE', 'BADLY', 'BAELS',
            'BAFFS', 'BAFFY', 'BAFTS', 'BAGEL', 'BAGGY', 'BAGHS', 'BAGIE', 'BAGSY', 'BAHAI', 'BAHTS',
            'BAHUS', 'BAHUT', 'BAILS', 'BAIRN', 'BAISA', 'BAITH', 'BAITS', 'BAIZA', 'BAIZE', 'BAJAN',
            'BAJRA', 'BAJRI', 'BAJUS', 'BAKED', 'BAKEN', 'BAKER', 'BAKES', 'BAKRA', 'BALAS', 'BALDS',
            'BALDY', 'BALED', 'BALER', 'BALES', 'BALKS', 'BALKY', 'BALLS', 'BALLY', 'BALMS', 'BALMY',
            'BALOO', 'BALSA', 'BALTI', 'BALUN', 'BALUS', 'BAMBI', 'BANAK', 'BANAL', 'BANCO', 'BANCS',
            'BANDA', 'BANDH', 'BANDS', 'BANDY', 'BANED', 'BANES', 'BANGS', 'BANIA', 'BANJO', 'BANKS',
            'BANNS', 'BANTU', 'BANTY', 'BANYA', 'BAPUS', 'BARBE', 'BARBS', 'BARBY', 'BARCA', 'BARDE',
            'BARDO', 'BARDS', 'BARDY', 'BARED', 'BARER', 'BARES', 'BARFS', 'BARGE', 'BARIC', 'BARKS',
            'BARKY', 'BARMS', 'BARMY', 'BARNS', 'BARNY', 'BARON', 'BARPS', 'BARRA', 'BARRE', 'BARRO',
            'BARRY', 'BARYE', 'BASAL', 'BASAN', 'BASED', 'BASER', 'BASES', 'BASHO', 'BASIC', 'BASIL',
            'BASIN', 'BASIS', 'BASKS', 'BASON', 'BASSE', 'BASSI', 'BASSO', 'BASSY', 'BASTA', 'BASTE',
            'BASTI', 'BASTO', 'BASTS', 'BATCH', 'BATED', 'BATES', 'BATHE', 'BATHS', 'BATIK', 'BATON',
            'BATTA', 'BATTS', 'BATTU', 'BATTY', 'BAUDS', 'BAUKS', 'BAULK', 'BAURS', 'BAVIN', 'BAWDS',
            'BAWDY', 'BAWKS', 'BAWLS', 'BAWNS', 'BAWRS', 'BAWTY', 'BAYED', 'BAYES', 'BAYLE', 'BAYOU',
            'BAYTS', 'BAZAR', 'BAZOO', 'BEACH', 'BEADS', 'BEADY', 'BEAKS', 'BEAKY', 'BEALS', 'BEAMS',
            'BEAMY', 'BEANO', 'BEANS', 'BEANY', 'BEARD', 'BEARE', 'BEARS', 'BEAST', 'BEATH', 'BEATS',
            'BEATY', 'BEAUS', 'BEAUT', 'BEAUX', 'BEBOP', 'BECAP', 'BECKE', 'BECKS', 'BEDAD', 'BEDEL',
            'BEDES', 'BEDEW', 'BEDIM', 'BEDYE', 'BEECH', 'BEEDI', 'BEEFS', 'BEEFY', 'BEEPS', 'BEERS',
            'BEERY', 'BEETS', 'BEFIT', 'BEFOG', 'BEGAN', 'BEGAT', 'BEGEM', 'BEGET', 'BEGIN', 'BEGOT',
            'BEGUM', 'BEGUN', 'BEIGE', 'BEIGY', 'BEING', 'BEINS', 'BEKAH', 'BELAH', 'BELAR', 'BELAY',
            'BELCH', 'BELEE', 'BELGA', 'BELIE', 'BELLE', 'BELLS', 'BELLY', 'BELON', 'BELOW', 'BELTS',
            'BEMAD', 'BEMAS', 'BEMIX', 'BEMUD', 'BENCH', 'BENDS', 'BENDY', 'BENES', 'BENET', 'BENGA',
            'BENIS', 'BENNE', 'BENNI', 'BENNY', 'BENTO', 'BENTS', 'BENTY', 'BEPAT', 'BERAY', 'BERES',
            'BERET', 'BERGS', 'BERKO', 'BERKS', 'BERME', 'BERMS', 'BEROB', 'BERRY', 'BERTH', 'BERYL',
            'BESAT', 'BESAW', 'BESEE', 'BESES', 'BESET', 'BESIT', 'BESOM', 'BESOT', 'BESTI', 'BESTS',
            'BETAS', 'BETED', 'BETEL', 'BETES', 'BETHS', 'BETID', 'BETON', 'BETTA', 'BETTY', 'BEVEL',
            'BEVER', 'BEVOR', 'BEVUE', 'BEVVY', 'BEWET', 'BEWIG', 'BEZEL', 'BEZIL', 'BEZZY', 'BHAIS',
            'BHAJI', 'BHANG', 'BHATS', 'BHELS', 'BHOOT', 'BHUNA', 'BHUTS', 'BIACH', 'BIALI', 'BIALY',
            'BIBBS', 'BIBES', 'BIBLE', 'BICCY', 'BICEP', 'BICES', 'BIDDY', 'BIDED', 'BIDER', 'BIDES',
            'BIDET', 'BIDIS', 'BIDON', 'BIELD', 'BIERS', 'BIFFO', 'BIFFS', 'BIFFY', 'BIFID', 'BIGAE',
            'BIGGS', 'BIGGY', 'BIGHA', 'BIGHT', 'BIGLY', 'BIGOS', 'BIGOT', 'BIJOU', 'BIKED', 'BIKER',
            'BIKES', 'BIKIE', 'BILBO', 'BILBY', 'BILED', 'BILES', 'BILGE', 'BILGY', 'BILKS', 'BILLS',
            'BILLY', 'BIMBO', 'BINAL', 'BINDI', 'BINDS', 'BINER', 'BINES', 'BINGE', 'BINGO', 'BINGS',
            'BINGY', 'BINIT', 'BINKS', 'BINTS', 'BIOGS', 'BIOME', 'BIONT', 'BIOTA', 'BIPED', 'BIPOD',
            'BIRCH', 'BIRDS', 'BIRKS', 'BIRLE', 'BIRLS', 'BIROS', 'BIRRS', 'BIRSE', 'BIRSY', 'BIRTH',
            'BISES', 'BISKS', 'BISKY', 'BISON', 'BITCH', 'BITER', 'BITES', 'BITOU', 'BITSY', 'BITTE',
            'BITTS', 'BITTY', 'BIVIA', 'BIVVY', 'BIZES', 'BIZZO', 'BIZZY', 'BLABS', 'BLACK', 'BLADE',
            'BLADS', 'BLADY', 'BLAER', 'BLAES', 'BLAFF', 'BLAGS', 'BLAHS', 'BLAIN', 'BLAME', 'BLAMS',
            'BLANC', 'BLAND', 'BLANK', 'BLARE', 'BLART', 'BLASE', 'BLASH', 'BLAST', 'BLATE', 'BLATS',
            'BLATT', 'BLAUD', 'BLAWN', 'BLAWS', 'BLAYS', 'BLAZE', 'BLEAK', 'BLEAR', 'BLEAT', 'BLEBS',
            'BLECH', 'BLEED', 'BLEEP', 'BLEES', 'BLEND', 'BLENT', 'BLERT', 'BLESS', 'BLEST', 'BLETS',
            'BLEYS', 'BLIMP', 'BLIMY', 'BLIND', 'BLING', 'BLINI', 'BLINK', 'BLINS', 'BLINY', 'BLIPS',
            'BLISS', 'BLIST', 'BLITE', 'BLITS', 'BLITZ', 'BLIVE', 'BLOAT', 'BLOBS', 'BLOCK', 'BLOCS',
            'BLOGS', 'BLOKE', 'BLOND', 'BLOOD', 'BLOOK', 'BLOOM', 'BLOOP', 'BLORE', 'BLOTS', 'BLOWN',
            'BLOWS', 'BLOWZ', 'BLOWY', 'BLUBS', 'BLUDE', 'BLUDS', 'BLUDY', 'BLUED', 'BLUER', 'BLUES',
            'BLUET', 'BLUEY', 'BLUFF', 'BLUID', 'BLUME', 'BLUNK', 'BLUNT', 'BLURB', 'BLURS', 'BLURT',
            'BLUSH', 'BLYPE', 'BOABS', 'BOAKS', 'BOARD', 'BOARS', 'BOART', 'BOAST', 'BOATS', 'BOBAC',
            'BOBAK', 'BOBAS', 'BOBBY', 'BOBOL', 'BOBOS', 'BOCCA', 'BOCCE', 'BOCCI', 'BOCHE', 'BOCKS',
            'BODED', 'BODES', 'BODGE', 'BODHI', 'BODLE', 'BOEPS', 'BOETS', 'BOEUF', 'BOFFO', 'BOFFS',
            'BOGAN', 'BOGEY', 'BOGGY', 'BOGIE', 'BOGLE', 'BOGUS', 'BOHEA', 'BOHOS', 'BOILS', 'BOING',
            'BOINK', 'BOITE', 'BOKED', 'BOKEH', 'BOKES', 'BOKOS', 'BOLAR', 'BOLAS', 'BOLDS', 'BOLES',
            'BOLIX', 'BOLLS', 'BOLOS', 'BOLTS', 'BOLUS', 'BOMAS', 'BOMBE', 'BOMBO', 'BOMBS', 'BOMER',
            'BONCE', 'BONDS', 'BONED', 'BONER', 'BONES', 'BONEY', 'BONGO', 'BONGS', 'BONIE', 'BONKS',
            'BONNE', 'BONNY', 'BONUS', 'BONZA', 'BONZE', 'BOOAI', 'BOOAY', 'BOOBS', 'BOOBY', 'BOODY',
            'BOOED', 'BOOFY', 'BOOGY', 'BOOHS', 'BOOKS', 'BOOKY', 'BOOLS', 'BOOMS', 'BOOMY', 'BOONG',
            'BOONS', 'BOORD', 'BOORS', 'BOOSE', 'BOOST', 'BOOTH', 'BOOTS', 'BOOTY', 'BOOZE', 'BOOZY',
            'BOPPY', 'BORAK', 'BORAL', 'BORAN', 'BORAS', 'BORAX', 'BORDE', 'BORDS', 'BORED', 'BOREE',
            'BOREL', 'BORER', 'BORES', 'BORGO', 'BORIC', 'BORKS', 'BORMS', 'BORNA', 'BORNE', 'BORON',
            'BORPS', 'BORTY', 'BORTZ', 'BOSIE', 'BOSKS', 'BOSKY', 'BOSOM', 'BOSON', 'BOSSY', 'BOSUN',
            'BOTCH', 'BOTEL', 'BOTES', 'BOTHY', 'BOTTE', 'BOTTS', 'BOTTY', 'BOUGE', 'BOUGH', 'BOUKS',
            'BOULE', 'BOULT', 'BOUND', 'BOUNS', 'BOURD', 'BOURG', 'BOURN', 'BOUSE', 'BOUSY', 'BOUTS',
            'BOVID', 'BOWAT', 'BOWED', 'BOWEL', 'BOWER', 'BOWES', 'BOWET', 'BOWIE', 'BOWLS', 'BOWNE',
            'BOWRS', 'BOWSE', 'BOXED', 'BOXEN', 'BOXER', 'BOXES', 'BOXLA', 'BOXTY', 'BOYAR', 'BOYAU',
            'BOYED', 'BOYER', 'BOYFS', 'BOYGS', 'BOYLA', 'BOYOS', 'BOYSY', 'BOZOS', 'BRAAI', 'BRACE',
            'BRACH', 'BRACK', 'BRACT', 'BRADS', 'BRAES', 'BRAGS', 'BRAID', 'BRAIL', 'BRAIN', 'BRAKE',
            'BRAKS', 'BRAKY', 'BRAME', 'BRAND', 'BRANE', 'BRANK', 'BRANS', 'BRANT', 'BRASH', 'BRASS',
            'BRAST', 'BRATS', 'BRAVA', 'BRAVE', 'BRAVI', 'BRAVO', 'BRAWL', 'BRAWN', 'BRAWS', 'BRAXY',
            'BRAYS', 'BRAZA', 'BRAZE', 'BREAD', 'BREAK', 'BREAM', 'BREDE', 'BREDS', 'BREED', 'BREEM',
            'BREER', 'BREES', 'BREID', 'BREIS', 'BREME', 'BRENS', 'BRENT', 'BRERE', 'BRERS', 'BREVE',
            'BREWS', 'BREYS', 'BRIAR', 'BRIBE', 'BRICK', 'BRIDE', 'BRIEF', 'BRIER', 'BRIES', 'BRIGS',
            'BRIKI', 'BRIKS', 'BRILL', 'BRIMS', 'BRINE', 'BRING', 'BRINK', 'BRINS', 'BRINY', 'BRIOS',
            'BRISE', 'BRISK', 'BRISS', 'BRITH', 'BRITS', 'BRITT', 'BRIZE', 'BROAD', 'BROBS', 'BROCH',
            'BROCK', 'BRODS', 'BROGH', 'BROGS', 'BROIL', 'BROKE', 'BROME', 'BROMO', 'BRONC', 'BROND',
            'BROOD', 'BROOK', 'BROOL', 'BROOM', 'BROOS', 'BROSE', 'BROSY', 'BROTH', 'BROWN', 'BROWS',
            'BRUCE', 'BRUGH', 'BRUIN', 'BRUIT', 'BRUJA', 'BRUJO', 'BRUKE', 'BRULE', 'BRUME', 'BRUMP',
            'BRUNG', 'BRUNK', 'BRUNT', 'BRUSH', 'BRUSK', 'BRUST', 'BRUTE', 'BRUTS', 'BUATS', 'BUAZE',
            'BUBAL', 'BUBAS', 'BUBBA', 'BUBBE', 'BUBBY', 'BUBUS', 'BUCHU', 'BUCKO', 'BUCKS', 'BUCKU',
            'BUDDY', 'BUDGE', 'BUDIS', 'BUDOS', 'BUFFA', 'BUFFE', 'BUFFI', 'BUFFO', 'BUFFS', 'BUFFY',
            'BUFOS', 'BUGGY', 'BUGLE', 'BUHLS', 'BUHRS', 'BUIKS', 'BUILD', 'BUILT', 'BUIST', 'BUKES',
            'BULBS', 'BULGE', 'BULGY', 'BULKS', 'BULKY', 'BULLA', 'BULLS', 'BULLY', 'BULSE', 'BUMBO',
            'BUMFS', 'BUMPH', 'BUMPS', 'BUMPY', 'BUNAS', 'BUNCE', 'BUNCH', 'BUNCO', 'BUNDE', 'BUNDH',
            'BUNDS', 'BUNDT', 'BUNDU', 'BUNDY', 'BUNGS', 'BUNGY', 'BUNIA', 'BUNJE', 'BUNJY', 'BUNKO',
            'BUNKS', 'BUNNS', 'BUNNY', 'BUNTS', 'BUNTY', 'BUNYA', 'BUOYS', 'BUPPY', 'BURAN', 'BURAS',
            'BURBS', 'BURDS', 'BURET', 'BURFI', 'BURGH', 'BURGS', 'BURIN', 'BURKA', 'BURKE', 'BURKS',
            'BURLS', 'BURLY', 'BURNS', 'BURNT', 'BUROO', 'BURPS', 'BURQA', 'BURRO', 'BURRS', 'BURRY',
            'BURSA', 'BURSE', 'BURST', 'BUSBY', 'BUSED', 'BUSES', 'BUSHY', 'BUSKS', 'BUSKY', 'BUSSE',
            'BUSSU', 'BUSTI', 'BUSTS', 'BUSTY', 'BUTCH', 'BUTEO', 'BUTES', 'BUTLE', 'BUTOH', 'BUTTS',
            'BUTTY', 'BUTUT', 'BUTYL', 'BUXOM', 'BUYER', 'BUZZY', 'BWANA', 'BWAZI', 'BYDED', 'BYDES',
            'BYKED', 'BYKES', 'BYLAW', 'BYRES', 'BYRLS', 'BYRON', 'BYWAY', 'BYSSI', 'BYTES', 'BYRES',
            
            // C words
            'CABAL', 'CABAS', 'CABBY', 'CABER', 'CABIN', 'CABLE', 'CABOB', 'CABOC', 'CABRE', 'CACAO',
            'CACAS', 'CACHE', 'CACKS', 'CACKY', 'CACTI', 'CADES', 'CADET', 'CADGE', 'CADGY', 'CADIE',
            'CADIS', 'CADRE', 'CAECA', 'CAESE', 'CAFES', 'CAFFS', 'CAGED', 'CAGER', 'CAGES', 'CAGEY',
            'CAGOT', 'CAHOW', 'CAIDS', 'CAINS', 'CAIRD', 'CAIRN', 'CAJON', 'CAJUN', 'CAKED', 'CAKES',
            'CAKEY', 'CALFS', 'CALID', 'CALIF', 'CALIX', 'CALKS', 'CALLA', 'CALLS', 'CALMS', 'CALMY',
            'CALOS', 'CALPA', 'CALPS', 'CALVE', 'CALYX', 'CAMAN', 'CAMAS', 'CAMEL', 'CAMEO', 'CAMES',
            'CAMIS', 'CAMOS', 'CAMPI', 'CAMPO', 'CAMPS', 'CAMPY', 'CAMUS', 'CANAL', 'CANDY', 'CANED',
            'CANEH', 'CANER', 'CANES', 'CANGS', 'CANID', 'CANNA', 'CANNS', 'CANNY', 'CANOE', 'CANON',
            'CANSO', 'CANST', 'CANTO', 'CANTS', 'CANTY', 'CAPAS', 'CAPED', 'CAPER', 'CAPES', 'CAPEX',
            'CAPHS', 'CAPIZ', 'CAPLE', 'CAPON', 'CAPOS', 'CAPOT', 'CAPRI', 'CAPUL', 'CAPUT', 'CARAP',
            'CARAT', 'CARBO', 'CARBS', 'CARBY', 'CARDI', 'CARDS', 'CARDY', 'CARED', 'CARER', 'CARES',
            'CARET', 'CAREX', 'CARGO', 'CARKS', 'CARLE', 'CARLS', 'CARNS', 'CARNY', 'CAROB', 'CAROL',
            'CAROM', 'CARON', 'CARPI', 'CARPS', 'CARRS', 'CARRY', 'CARSE', 'CARTA', 'CARTE', 'CARTS',
            'CARVE', 'CARVY', 'CASAS', 'CASCO', 'CASED', 'CASER', 'CASES', 'CASKS', 'CASKY', 'CASTE',
            'CASTS', 'CASUS', 'CATCH', 'CATER', 'CATES', 'CATTY', 'CAUDA', 'CAUKS', 'CAULS', 'CAUMS',
            'CAUPS', 'CAURI', 'CAUSA', 'CAUSE', 'CAUSY', 'CAVAS', 'CAVED', 'CAVEL', 'CAVER', 'CAVES',
            'CAVIE', 'CAVIL', 'CAWED', 'CAWKS', 'CAXON', 'CEASE', 'CEBID', 'CECAL', 'CECUM', 'CEDAR',
            'CEDED', 'CEDER', 'CEDES', 'CEDIS', 'CEIBA', 'CEILI', 'CEILS', 'CELLA', 'CELLI', 'CELLO',
            'CELLS', 'CELOM', 'CELTS', 'CENSE', 'CENTO', 'CENTS', 'CENTU', 'CEORL', 'CEPES', 'CERCI',
            'CERED', 'CERES', 'CERGE', 'CERIA', 'CERIC', 'CERNE', 'CEROC', 'CEROS', 'CERTS', 'CERTY',
            'CESSE', 'CESTA', 'CESTI', 'CETES', 'CETYL', 'CEZVE', 'CHACE', 'CHACK', 'CHACO', 'CHADO',
            'CHADS', 'CHAFE', 'CHAFF', 'CHAFT', 'CHAIN', 'CHAIR', 'CHAIS', 'CHALK', 'CHALS', 'CHAMP',
            'CHAMS', 'CHANA', 'CHANG', 'CHANK', 'CHANT', 'CHAOS', 'CHAPE', 'CHAPS', 'CHAPT', 'CHARA',
            'CHARD', 'CHARE', 'CHARK', 'CHARM', 'CHARR', 'CHARS', 'CHART', 'CHARY', 'CHASE', 'CHASM',
            'CHATS', 'CHAVE', 'CHAVS', 'CHAWK', 'CHAWS', 'CHAYA', 'CHAYS', 'CHEAP', 'CHEAT', 'CHECK',
            'CHEEK', 'CHEEP', 'CHEER', 'CHEFS', 'CHEKA', 'CHELA', 'CHELP', 'CHEMO', 'CHEMS', 'CHERE',
            'CHERT', 'CHESS', 'CHEST', 'CHETH', 'CHEVY', 'CHEWS', 'CHEWY', 'CHIAO', 'CHIAS', 'CHIBS',
            'CHICA', 'CHICH', 'CHICK', 'CHICO', 'CHICS', 'CHIDE', 'CHIEF', 'CHIEL', 'CHIKS', 'CHILD',
            'CHILE', 'CHILI', 'CHILL', 'CHIMB', 'CHIME', 'CHIMO', 'CHIMP', 'CHINA', 'CHINE', 'CHING',
            'CHINK', 'CHINO', 'CHINS', 'CHIPS', 'CHIRK', 'CHIRL', 'CHIRM', 'CHIRO', 'CHIRP', 'CHIRR',
            'CHIRT', 'CHIRU', 'CHITS', 'CHIVE', 'CHIVS', 'CHIVY', 'CHIZZ', 'CHOCK', 'CHOCO', 'CHOCS',
            'CHODE', 'CHOGS', 'CHOIL', 'CHOIR', 'CHOKE', 'CHOKO', 'CHOKY', 'CHOLA', 'CHOLI', 'CHOLO',
            'CHOMP', 'CHONS', 'CHOOF', 'CHOOK', 'CHOOM', 'CHOON', 'CHOPS', 'CHORD', 'CHORE', 'CHOSE',
            'CHOSS', 'CHOTA', 'CHOTT', 'CHOUT', 'CHOUX', 'CHOWK', 'CHOWS', 'CHUBS', 'CHUCK', 'CHUFA',
            'CHUFF', 'CHUGS', 'CHUMP', 'CHUMS', 'CHUNK', 'CHURL', 'CHURN', 'CHURR', 'CHUSE', 'CHUTE',
            'CHUTS', 'CHYLE', 'CHYME', 'CHYND', 'CIBOL', 'CIDED', 'CIDER', 'CIDES', 'CIELS', 'CIGAR',
            'CIGGY', 'CILIA', 'CILLS', 'CIMAR', 'CIMEX', 'CINCH', 'CINCT', 'CINES', 'CINQS', 'CIONS',
            'CIPPI', 'CIRCA', 'CIRCS', 'CIRES', 'CIRLS', 'CIRRI', 'CISCO', 'CISSY', 'CISTS', 'CITAL',
            'CITED', 'CITER', 'CITES', 'CIVES', 'CIVET', 'CIVIC', 'CIVIE', 'CIVIL', 'CIVVY', 'CLACH',
            'CLACK', 'CLADE', 'CLADS', 'CLAES', 'CLAGS', 'CLAIM', 'CLAME', 'CLAMP', 'CLAMS', 'CLANG',
            'CLANK', 'CLANS', 'CLAPS', 'CLAPT', 'CLARE', 'CLARO', 'CLART', 'CLARY', 'CLASH', 'CLASP',
            'CLASS', 'CLAST', 'CLATS', 'CLAUT', 'CLAVE', 'CLAVI', 'CLAWS', 'CLAYS', 'CLEAN', 'CLEAR',
            'CLEAT', 'CLECK', 'CLEEK', 'CLEEP', 'CLEFS', 'CLEFT', 'CLEGS', 'CLEIK', 'CLEME', 'CLEMS',
            'CLEPE', 'CLEPT', 'CLERK', 'CLEVE', 'CLEWS', 'CLICK', 'CLIED', 'CLIES', 'CLIFF', 'CLIFT',
            'CLIMB', 'CLIME', 'CLINE', 'CLING', 'CLINK', 'CLINT', 'CLIPE', 'CLIPS', 'CLIPT', 'CLITS',
            'CLOAK', 'CLOAM', 'CLOBS', 'CLOCK', 'CLODS', 'CLOFF', 'CLOGS', 'CLOKE', 'CLOMB', 'CLOMP',
            'CLONE', 'CLONK', 'CLONS', 'CLOOP', 'CLOOT', 'CLOPS', 'CLORE', 'CLOSE', 'CLOTE', 'CLOTH',
            'CLOTS', 'CLOUD', 'CLOUR', 'CLOUS', 'CLOUT', 'CLOVE', 'CLOWN', 'CLOWS', 'CLOYE', 'CLOYS',
            'CLOZE', 'CLUBS', 'CLUCK', 'CLUED', 'CLUES', 'CLUEY', 'CLUMP', 'CLUNG', 'CLUNK', 'CLUPE',
            'CLUSH', 'CLUTZ', 'CLYPE', 'CNIDA', 'COACH', 'COACT', 'COADY', 'COALA', 'COALS', 'COALY',
            'COAPT', 'COARB', 'COAST', 'COATE', 'COATI', 'COATS', 'COBBS', 'COBBY', 'COBIA', 'COBLE',
            'COBZA', 'COCAS', 'COCCI', 'COCCO', 'COCKS', 'COCKY', 'COCOA', 'COCOS', 'CODAS', 'CODEC',
            'CODED', 'CODEN', 'CODER', 'CODES', 'CODEX', 'CODON', 'COEDS', 'COFFS', 'COGIE', 'COGON',
            'COGUE', 'COHAB', 'COHEN', 'COHOE', 'COHOG', 'COHOS', 'COIFS', 'COIGN', 'COILS', 'COINS',
            'COIRS', 'COITS', 'COKED', 'COKER', 'COKES', 'COKEY', 'COLAS', 'COLBY', 'COLDS', 'COLED',
            'COLES', 'COLEY', 'COLIC', 'COLIN', 'COLLS', 'COLLY', 'COLOG', 'COLON', 'COLOR', 'COLTS',
            'COLZA', 'COMAE', 'COMAL', 'COMAS', 'COMBE', 'COMBI', 'COMBO', 'COMBS', 'COMBY', 'COMED',
            'COMER', 'COMES', 'COMET', 'COMFY', 'COMIC', 'COMIX', 'COMMA', 'COMMO', 'COMMS', 'COMMY',
            'COMPO', 'COMPS', 'COMPT', 'COMTE', 'COMUS', 'CONCH', 'CONDO', 'CONED', 'CONES', 'CONEY',
            'CONFS', 'CONGA', 'CONGE', 'CONGO', 'CONIA', 'CONIC', 'CONIN', 'CONKS', 'CONKY', 'CONNE',
            'CONNS', 'CONTE', 'CONTO', 'CONUS', 'CONVO', 'COOCH', 'COOED', 'COOEE', 'COOER', 'COOEY',
            'COOFS', 'COOKS', 'COOKY', 'COOLS', 'COOLY', 'COOMB', 'COOMS', 'COOMY', 'COONS', 'COOPS',
            'COOPT', 'COOST', 'COOTS', 'COOZE', 'COPAL', 'COPAY', 'COPED', 'COPEN', 'COPER', 'COPES',
            'COPPY', 'COPRA', 'COPSE', 'COPSY', 'COQUI', 'CORAL', 'CORAM', 'CORBE', 'CORBY', 'CORDS',
            'CORED', 'CORER', 'CORES', 'COREY', 'CORGI', 'CORIA', 'CORKS', 'CORKY', 'CORMS', 'CORNI',
            'CORNO', 'CORNS', 'CORNU', 'CORNY', 'CORPS', 'CORSE', 'CORSO', 'COSEC', 'COSED', 'COSES',
            'COSET', 'COSEY', 'COSIE', 'COSTA', 'COSTE', 'COSTS', 'COTAN', 'COTED', 'COTES', 'COTHS',
            'COTTA', 'COTTS', 'COUCH', 'COUDE', 'COUGH', 'COULD', 'COUNT', 'COUPE', 'COUPS', 'COURB',
            'COURD', 'COURE', 'COURS', 'COURT', 'COUTA', 'COUTH', 'COVED', 'COVEN', 'COVER', 'COVES',
            'COVET', 'COVEY', 'COVIN', 'COWAL', 'COWAN', 'COWED', 'COWER', 'COWKS', 'COWLS', 'COWPS',
            'COWRY', 'COXAE', 'COXAL', 'COXED', 'COXES', 'COXIB', 'COYAU', 'COYED', 'COYER', 'COYLY',
            'COYPU', 'COZED', 'COZEN', 'COZES', 'COZEY', 'COZIE', 'CRAAL', 'CRABS', 'CRACK', 'CRAFT',
            'CRAGS', 'CRAIC', 'CRAIG', 'CRAKE', 'CRAME', 'CRAMP', 'CRAMS', 'CRANE', 'CRANK', 'CRANS',
            'CRAPE', 'CRAPS', 'CRAPY', 'CRARE', 'CRASH', 'CRASS', 'CRATE', 'CRAVE', 'CRAWK', 'CRAWL',
            'CRAWS', 'CRAYS', 'CRAZE', 'CRAZY', 'CREAK', 'CREAM', 'CREAS', 'CREDO', 'CREDS', 'CREED',
            'CREEK', 'CREEL', 'CREEP', 'CREES', 'CREME', 'CREMS', 'CRENA', 'CREPE', 'CREPS', 'CREPT',
            'CREPY', 'CRESS', 'CREST', 'CREWE', 'CREWS', 'CRIAS', 'CRIBS', 'CRICK', 'CRIED', 'CRIER',
            'CRIES', 'CRIME', 'CRIMP', 'CRIMS', 'CRINE', 'CRIOS', 'CRIPE', 'CRIPS', 'CRISP', 'CRISS',
            'CRITH', 'CRITS', 'CROAK', 'CROCI', 'CROCK', 'CROCS', 'CROFT', 'CROGS', 'CROMB', 'CROME',
            'CRONE', 'CRONK', 'CRONS', 'CRONY', 'CROOK', 'CROOL', 'CROON', 'CROPS', 'CRORE', 'CROSS',
            'CROST', 'CROUP', 'CROUT', 'CROWD', 'CROWN', 'CROWS', 'CROZE', 'CRUCK', 'CRUDE', 'CRUDO',
            'CRUDS', 'CRUDY', 'CRUEL', 'CRUES', 'CRUET', 'CRUFT', 'CRUMB', 'CRUMP', 'CRUNK', 'CRUOR',
            'CRURA', 'CRUSE', 'CRUSH', 'CRUST', 'CRUSY', 'CRUVE', 'CRWTH', 'CRYER', 'CRYPT', 'CTENE',
            'CUBBY', 'CUBEB', 'CUBED', 'CUBER', 'CUBES', 'CUBIC', 'CUBIT', 'CUDDY', 'CUDGE', 'CUFFO',
            'CUFFS', 'CUIFS', 'CUING', 'CUISH', 'CUITS', 'CUKES', 'CULCH', 'CULET', 'CULEX', 'CULLS',
            'CULLY', 'CULMS', 'CULPA', 'CULTI', 'CULTS', 'CULTY', 'CUMEC', 'CUMIN', 'CUNDY', 'CUNEI',
            'CUNIT', 'CUNTS', 'CUPEL', 'CUPID', 'CUPPA', 'CUPPY', 'CURBS', 'CURCH', 'CURDS', 'CURDY',
            'CURED', 'CURER', 'CURES', 'CURET', 'CURFS', 'CURIA', 'CURIE', 'CURIO', 'CURLI', 'CURLS',
            'CURLY', 'CURNS', 'CURNY', 'CURRS', 'CURRY', 'CURSE', 'CURSI', 'CURST', 'CURVE', 'CURVY',
            'CUSEC', 'CUSHY', 'CUSKS', 'CUSPS', 'CUSPY', 'CUSSO', 'CUSUM', 'CUTCH', 'CUTER', 'CUTES',
            'CUTEY', 'CUTIE', 'CUTIN', 'CUTIS', 'CUTTO', 'CUTTY', 'CUTUP', 'CUVEE', 'CUZES', 'CUZZY',
            'CYANO', 'CYANS', 'CYBER', 'CYCAD', 'CYCAS', 'CYCLE', 'CYCLO', 'CYDER', 'CYLIX', 'CYMAE',
            'CYMAR', 'CYMAS', 'CYMES', 'CYNIC', 'CYSTS', 'CYTES', 'CYTON', 'CZARS',
            
            // D words
            'DAALS', 'DABBA', 'DADOS', 'DAFFS', 'DAFFY', 'DAGGA', 'DAGGY', 'DAGOS', 'DAHLS', 'DAILY',
            'DAINE', 'DAINT', 'DAIRY', 'DAISY', 'DAKER', 'DALED', 'DALES', 'DALIS', 'DALLE', 'DALLY',
            'DALTS', 'DAMAN', 'DAMAR', 'DAMES', 'DAMME', 'DAMNS', 'DAMPS', 'DAMPY', 'DANCE', 'DANCY',
            'DANDY', 'DANGS', 'DANIO', 'DANKS', 'DANNY', 'DANTS', 'DARAF', 'DARBS', 'DARCY', 'DARED',
            'DARER', 'DARES', 'DARGA', 'DARGS', 'DARIC', 'DARIS', 'DARKS', 'DARKY', 'DARNS', 'DARRE',
            'DARTS', 'DARZI', 'DASHI', 'DASHY', 'DATAL', 'DATED', 'DATER', 'DATES', 'DATOS', 'DATTO',
            'DATUM', 'DAUBE', 'DAUBS', 'DAUBY', 'DAUDS', 'DAULT', 'DAUNT', 'DAURS', 'DAUTS', 'DAVEN',
            'DAVIT', 'DAWAH', 'DAWDS', 'DAWED', 'DAWEN', 'DAWKS', 'DAWNS', 'DAWTS', 'DAYAN', 'DAYCH',
            'DAYNT', 'DAZED', 'DAZER', 'DAZES', 'DEADS', 'DEAFY', 'DEALS', 'DEALT', 'DEANS', 'DEARE',
            'DEARN', 'DEARS', 'DEARY', 'DEASH', 'DEATH', 'DEAVE', 'DEAWS', 'DEAWY', 'DEBAG', 'DEBAR',
            'DEBBY', 'DEBEL', 'DEBES', 'DEBIT', 'DEBTS', 'DEBUD', 'DEBUG', 'DEBUR', 'DEBUS', 'DEBUT',
            'DEBYE', 'DECAD', 'DECAF', 'DECAL', 'DECAN', 'DECAY', 'DECKO', 'DECKS', 'DECOR', 'DECOY',
            'DECRY', 'DEDAL', 'DEEDS', 'DEEDY', 'DEELY', 'DEEMS', 'DEENS', 'DEEPS', 'DEERE', 'DEERS',
            'DEETS', 'DEEVE', 'DEEVS', 'DEFAT', 'DEFER', 'DEFFO', 'DEFIS', 'DEFOG', 'DEGAS', 'DEGUM',
            'DEGUS', 'DEICE', 'DEIDS', 'DEIFY', 'DEIGN', 'DEILS', 'DEINK', 'DEISM', 'DEIST', 'DEITY',
            'DEKED', 'DEKES', 'DEKKO', 'DELAY', 'DELED', 'DELES', 'DELFS', 'DELFT', 'DELIS', 'DELLS',
            'DELLY', 'DELPH', 'DELTA', 'DELTS', 'DELVE', 'DEMAN', 'DEMES', 'DEMIC', 'DEMIT', 'DEMOB',
            'DEMOI', 'DEMON', 'DEMOS', 'DEMPT', 'DEMUR', 'DENAR', 'DENAY', 'DENCH', 'DENES', 'DENET',
            'DENIM', 'DENSE', 'DENTS', 'DEOXY', 'DEPOT', 'DEPTH', 'DERAT', 'DERAY', 'DERBY', 'DERED',
            'DERES', 'DERIG', 'DERMA', 'DERMS', 'DERNS', 'DERNY', 'DEROS', 'DERRO', 'DERRY', 'DERTH',
            'DERVS', 'DESEX', 'DESHI', 'DESKS', 'DESSE', 'DETER', 'DETOX', 'DEUCE', 'DEVAS', 'DEVEL',
            'DEVIL', 'DEVIS', 'DEVON', 'DEVOT', 'DEWAN', 'DEWAR', 'DEWAX', 'DEWED', 'DEXES', 'DEXIE',
            'DHABA', 'DHAKS', 'DHALS', 'DHIKR', 'DHOBI', 'DHOLE', 'DHOLL', 'DHOLS', 'DHOTI', 'DHOWS',
            'DHUTI', 'DIACT', 'DIALS', 'DIANA', 'DIARY', 'DIAZO', 'DIBBS', 'DICED', 'DICER', 'DICES',
            'DICEY', 'DICHT', 'DICKS', 'DICKY', 'DICOT', 'DICTA', 'DICTS', 'DICTY', 'DIDIE', 'DIDOS',
            'DIDST', 'DIEBS', 'DIELS', 'DIENE', 'DIETS', 'DIFFS', 'DIGHT', 'DIGIT', 'DIKAS', 'DIKED',
            'DIKER', 'DIKES', 'DIKEY', 'DILDO', 'DILLI', 'DILLS', 'DILLY', 'DIMBO', 'DIMER', 'DIMES',
            'DIMLY', 'DIMPS', 'DINAR', 'DINED', 'DINER', 'DINES', 'DINGE', 'DINGO', 'DINGS', 'DINGY',
            'DINIC', 'DINKS', 'DINKY', 'DINNA', 'DINOS', 'DINTS', 'DIODE', 'DIOLS', 'DIOTA', 'DIPPY',
            'DIPSO', 'DIRAM', 'DIRER', 'DIRGE', 'DIRKE', 'DIRKS', 'DIRLS', 'DIRTS', 'DIRTY', 'DISAS',
            'DISCI', 'DISCO', 'DISCS', 'DISHY', 'DISKS', 'DISME', 'DITAL', 'DITAS', 'DITCH', 'DITES',
            'DITSY', 'DITTO', 'DITTS', 'DITTY', 'DITZY', 'DIVAN', 'DIVAS', 'DIVED', 'DIVER', 'DIVES',
            'DIVIS', 'DIVNA', 'DIVOS', 'DIVOT', 'DIVVY', 'DIWAN', 'DIXIE', 'DIXIT', 'DIZEN', 'DIZZY',
            'DJINN', 'DJINS', 'DOABS', 'DOATS', 'DOBBY', 'DOBES', 'DOBIE', 'DOBLA', 'DOBRA', 'DOBRO',
            'DOCHT', 'DOCKS', 'DOCOS', 'DOCUS', 'DODDY', 'DODGE', 'DODGY', 'DODOS', 'DOEKS', 'DOERS',
            'DOEST', 'DOETH', 'DOFFS', 'DOGAN', 'DOGES', 'DOGEY', 'DOGGO', 'DOGGY', 'DOGIE', 'DOGMA',
            'DOHYO', 'DOILY', 'DOING', 'DOITS', 'DOJOS', 'DOLCE', 'DOLCI', 'DOLED', 'DOLES', 'DOLIA',
            'DOLLS', 'DOLLY', 'DOLMA', 'DOLOR', 'DOLOS', 'DOLTS', 'DOMAL', 'DOMED', 'DOMES', 'DOMIC',
            'DONAH', 'DONAS', 'DONEE', 'DONER', 'DONES', 'DONGA', 'DONGS', 'DONKO', 'DONNA', 'DONNE',
            'DONNY', 'DONOR', 'DONSY', 'DONUT', 'DOOBS', 'DOOCE', 'DOODY', 'DOOKS', 'DOOLE', 'DOOLS',
            'DOOLY', 'DOOMS', 'DOOMY', 'DOONA', 'DOORN', 'DOORS', 'DOOZY', 'DOPAS', 'DOPED', 'DOPER',
            'DOPES', 'DOPEY', 'DORAD', 'DORBA', 'DORBS', 'DOREE', 'DORES', 'DORIC', 'DORIS', 'DORKS',
            'DORKY', 'DORMS', 'DORMY', 'DORPS', 'DORRS', 'DORSA', 'DORSE', 'DORTS', 'DORTY', 'DOSAI',
            'DOSAS', 'DOSED', 'DOSEH', 'DOSER', 'DOSES', 'DOTAL', 'DOTED', 'DOTER', 'DOTES', 'DOTTY',
            'DOUAR', 'DOUBT', 'DOUCE', 'DOUCS', 'DOUGH', 'DOUKS', 'DOULA', 'DOUMA', 'DOUMS', 'DOUPS',
            'DOURA', 'DOUSE', 'DOUTS', 'DOVED', 'DOVEN', 'DOVER', 'DOVES', 'DOVIE', 'DOWAR', 'DOWDS',
            'DOWDY', 'DOWED', 'DOWEL', 'DOWER', 'DOWIE', 'DOWLE', 'DOWLS', 'DOWLY', 'DOWNA', 'DOWNS',
            'DOWNY', 'DOWPS', 'DOWRY', 'DOWSE', 'DOWTS', 'DOXED', 'DOXES', 'DOXIE', 'DOYEN', 'DOYLY',
            'DOZED', 'DOZEN', 'DOZER', 'DOZES', 'DRABS', 'DRACK', 'DRACO', 'DRAFF', 'DRAFT', 'DRAGS',
            'DRAIL', 'DRAIN', 'DRAKE', 'DRAMA', 'DRAMS', 'DRANK', 'DRANT', 'DRAPE', 'DRAPS', 'DRATS',
            'DRAVE', 'DRAWL', 'DRAWN', 'DRAWS', 'DRAYS', 'DREAD', 'DREAM', 'DREAR', 'DRECK', 'DREED',
            'DREGS', 'DREKS', 'DRENT', 'DRERE', 'DRESS', 'DREST', 'DREYS', 'DRIBS', 'DRICE', 'DRIED',
            'DRIER', 'DRIES', 'DRIFT', 'DRILL', 'DRILY', 'DRINK', 'DRIPS', 'DRIPT', 'DRIVE', 'DROIT',
            'DROKE', 'DROLE', 'DROLL', 'DROME', 'DRONE', 'DRONY', 'DROOG', 'DROOK', 'DROOL', 'DROOP',
            'DROPS', 'DROPT', 'DROSS', 'DROUK', 'DROVE', 'DROWN', 'DROWS', 'DROWSE','DRUBS', 'DRUCE',
            'DRUGS', 'DRUID', 'DRUMS', 'DRUNK', 'DRUPE', 'DRUSE', 'DRUSY', 'DRUXY', 'DRYAD', 'DRYAS',
            'DRYER', 'DRYLY', 'DSOBO', 'DSOMO', 'DUADS', 'DUALS', 'DUANS', 'DUARS', 'DUBBO', 'DUCAL',
            'DUCAT', 'DUCES', 'DUCHY', 'DUCKS', 'DUCKY', 'DUCTS', 'DUDDY', 'DUDED', 'DUDES', 'DUELS',
            'DUETS', 'DUETT', 'DUFFS', 'DUFUS', 'DUING', 'DUITS', 'DUKAS', 'DUKED', 'DUKES', 'DUKKA',
            'DULCE', 'DULES', 'DULIA', 'DULLS', 'DULLY', 'DULSE', 'DUMAS', 'DUMBO', 'DUMBS', 'DUMKA',
            'DUMKY', 'DUMMY', 'DUMPS', 'DUMPY', 'DUNAM', 'DUNCE', 'DUNCH', 'DUNES', 'DUNGS', 'DUNGY',
            'DUNKS', 'DUNNO', 'DUNNY', 'DUNSH', 'DUNTS', 'DUOMI', 'DUOMO', 'DUPED', 'DUPER', 'DUPES',
            'DUPLE', 'DUPLY', 'DUPPY', 'DURAL', 'DURAS', 'DURED', 'DURES', 'DURGY', 'DURNS', 'DUROC',
            'DUROS', 'DUROY', 'DURRA', 'DURRS', 'DURRY', 'DURST', 'DURUM', 'DURZI', 'DUSHY', 'DUSKS',
            'DUSKY', 'DUSTS', 'DUSTY', 'DUTCH', 'DUVET', 'DUXES', 'DWAAL', 'DWALE', 'DWALM', 'DWAMS',
            'DWANG', 'DWARF', 'DWAUM', 'DWEEB', 'DWELL', 'DWELT', 'DWILE', 'DYADS', 'DYERS', 'DYING',
            'DYKED', 'DYKES', 'DYKEY', 'DYKON', 'DYNEL', 'DYNES', 'DYNOS', 'DZHOS',
            
            // E words
            'EAGER', 'EAGLE', 'EAGRE', 'EALED', 'EALES', 'EANED', 'EARDS', 'EARED', 'EARLS', 'EARLY',
            'EARNS', 'EARNT', 'EARTH', 'EASED', 'EASEL', 'EASER', 'EASES', 'EASLE', 'EASTS', 'EATEN',
            'EATER', 'EATHE', 'EAVED', 'EAVES', 'EBBED', 'EBBET', 'EBONS', 'EBONY', 'EBOOK', 'ECADS',
            'ECARD', 'ECASH', 'ECATS', 'ECCLE', 'ECHOS', 'ECLAT', 'ECODS', 'ECRUS', 'EDEMA', 'EDGED',
            'EDGER', 'EDGES', 'EDICT', 'EDIFY', 'EDILE', 'EDITS', 'EDUCE', 'EDUCT', 'EEJIT', 'EENSY',
            'EERIE', 'EEVEN', 'EEVER', 'EFFED', 'EGADS', 'EGERS', 'EGEST', 'EGGAR', 'EGGED', 'EGGER',
            'EGGOS', 'EGRET', 'EHING', 'EIDER', 'EIDOS', 'EIGHT', 'EIGNE', 'EIKED', 'EIKON', 'EILDS',
            'EISEL', 'EJECT', 'EJIDO', 'EKING', 'EKKAS', 'ELAIN', 'ELAND', 'ELANS', 'ELATE', 'ELBOW',
            'ELCHI', 'ELDER', 'ELDIN', 'ELECT', 'ELEGY', 'ELEMI', 'ELFED', 'ELFIN', 'ELIAD', 'ELIDE',
            'ELINT', 'ELITE', 'ELMEN', 'ELOGE', 'ELOGY', 'ELOIN', 'ELOPE', 'ELOPS', 'ELPEE', 'ELSIN',
            'ELUDE', 'ELUTE', 'ELVAN', 'ELVEN', 'ELVER', 'ELVES', 'EMACS', 'EMAIL', 'EMBAR', 'EMBAY',
            'EMBED', 'EMBER', 'EMBOG', 'EMBOW', 'EMBOX', 'EMBUS', 'EMCEE', 'EMEER', 'EMEND', 'EMERG',
            'EMERY', 'EMEUS', 'EMICS', 'EMIRS', 'EMITS', 'EMMAS', 'EMMER', 'EMMET', 'EMMEW', 'EMMYS',
            'EMOJI', 'EMONG', 'EMOTE', 'EMOVE', 'EMPTS', 'EMPTY', 'EMULE', 'EMURE', 'EMYDE', 'EMYDS',
            'ENACT', 'ENAGE', 'ENARM', 'ENATE', 'ENDED', 'ENDER', 'ENDEW', 'ENDOW', 'ENDUE', 'ENEMA',
            'ENEMY', 'ENEWS', 'ENFIX', 'ENIAC', 'ENJOY', 'ENLIT', 'ENMEW', 'ENNOG', 'ENNUI', 'ENOKI',
            'ENOLS', 'ENORM', 'ENOWS', 'ENROL', 'ENSEW', 'ENSKY', 'ENSUE', 'ENTER', 'ENTIA', 'ENTRE',
            'ENTRY', 'ENURE', 'ENURN', 'ENVOI', 'ENVOY', 'ENZYM', 'EORLS', 'EOSIN', 'EPACT', 'EPEES',
            'EPHAH', 'EPHAS', 'EPHOD', 'EPHOR', 'EPICS', 'EPOCH', 'EPODE', 'EPOPT', 'EPOXY', 'EPRIS',
            'EQUAL', 'EQUES', 'EQUID', 'EQUIP', 'ERASE', 'ERBIA', 'ERECT', 'EREVS', 'ERGON', 'ERGOS',
            'ERGOT', 'ERHUS', 'ERICA', 'ERICS', 'ERING', 'ERNED', 'ERNES', 'ERODE', 'EROSE', 'ERRED',
            'ERROR', 'ERSES', 'ERUCT', 'ERUGO', 'ERUPT', 'ERUVS', 'ERVEN', 'ERVIL', 'ESCAR', 'ESCOT',
            'ESILE', 'ESKAR', 'ESKER', 'ESNES', 'ESSAY', 'ESSES', 'ESTER', 'ESTOC', 'ESTOP', 'ESTRO',
            'ETAGE', 'ETAPE', 'ETATS', 'ETENS', 'ETHAL', 'ETHER', 'ETHIC', 'ETHNE', 'ETHOS', 'ETHYL',
            'ETICS', 'ETNAS', 'ETTIN', 'ETTLE', 'ETUDE', 'ETUIS', 'ETWEE', 'ETYMA', 'EUGHS', 'EUKED',
            'EUPAD', 'EUROS', 'EUSOL', 'EVADE', 'EVENS', 'EVENT', 'EVERT', 'EVERY', 'EVETS', 'EVICT',
            'EVILS', 'EVITE', 'EVOKE', 'EWERS', 'EWEST', 'EWHOW', 'EXACT', 'EXALT', 'EXAMS', 'EXCEL',
            'EXEAT', 'EXECS', 'EXEEM', 'EXEME', 'EXERT', 'EXFIL', 'EXIES', 'EXILE', 'EXINE', 'EXING',
            'EXIST', 'EXITS', 'EXODE', 'EXOME', 'EXONS', 'EXPAT', 'EXPEL', 'EXPOS', 'EXTOL', 'EXTRA',
            'EXUDE', 'EXULS', 'EXULT', 'EXURB', 'EYASS', 'EYING', 'EYOTS', 'EYRAS', 'EYRES', 'EYRIE',
            'EYRIR',
            
            // F words
            'FABLE', 'FACED', 'FACER', 'FACES', 'FACET', 'FACIA', 'FACTS', 'FADDY', 'FADED', 'FADER',
            'FADES', 'FADGE', 'FADOS', 'FAENA', 'FAERY', 'FAFFS', 'FAFFY', 'FAGGY', 'FAGIN', 'FAGOT',
            'FAIKS', 'FAILS', 'FAINE', 'FAINS', 'FAINT', 'FAIRS', 'FAIRY', 'FAITH', 'FAKED', 'FAKER',
            'FAKES', 'FAKEY', 'FAKIR', 'FALAJ', 'FALLS', 'FALSE', 'FAMED', 'FAMES', 'FANDS', 'FANES',
            'FANGA', 'FANGO', 'FANGS', 'FANKS', 'FANNY', 'FANON', 'FANOS', 'FANUM', 'FAQIR', 'FARAD',
            'FARCE', 'FARCI', 'FARCY', 'FARDS', 'FARED', 'FARER', 'FARES', 'FARLE', 'FARLS', 'FARMS',
            'FAROS', 'FARSE', 'FARTS', 'FASCI', 'FASTI', 'FASTS', 'FATAL', 'FATED', 'FATES', 'FATLY',
            'FATSO', 'FATTY', 'FATWA', 'FAUGH', 'FAULD', 'FAULT', 'FAUNA', 'FAUNS', 'FAURD', 'FAUTE',
            'FAUVE', 'FAVAS', 'FAVEL', 'FAVER', 'FAVES', 'FAVOR', 'FAVUS', 'FAWNS', 'FAWNY', 'FAXED',
            'FAXES', 'FAYED', 'FAKER', 'FAYNE', 'FAYRE', 'FAZED', 'FAZES', 'FEALS', 'FEARE', 'FEARS',
            'FEART', 'FEASE', 'FEAST', 'FEATS', 'FEAZE', 'FECAL', 'FECES', 'FECHT', 'FECIT', 'FECKS',
            'FEDEX', 'FEEBS', 'FEEDS', 'FEELS', 'FEENS', 'FEERS', 'FEESE', 'FEEZE', 'FEHME', 'FEIGN',
            'FEINT', 'FEIST', 'FELCH', 'FELID', 'FELLA', 'FELLS', 'FELLY', 'FELON', 'FELTS', 'FELTY',
            'FEMAL', 'FEMES', 'FEMME', 'FEMMY', 'FEMUR', 'FENCE', 'FENDS', 'FENDY', 'FENIS', 'FENKS',
            'FENNY', 'FENTS', 'FEODS', 'FEOFF', 'FERAL', 'FERER', 'FERES', 'FERIA', 'FERLY', 'FERMI',
            'FERMS', 'FERNS', 'FERNY', 'FERRY', 'FESSE', 'FESTS', 'FESTY', 'FETAL', 'FETAS', 'FETCH',
            'FETED', 'FETES', 'FETID', 'FETOR', 'FETTA', 'FETTS', 'FETUS', 'FETWA', 'FEUAR', 'FEUDS',
            'FEUED', 'FEVER', 'FEWER', 'FEYED', 'FEYER', 'FEYLY', 'FEZES', 'FEZZY', 'FIARS', 'FIATS',
            'FIBER', 'FIBRE', 'FIBRO', 'FICES', 'FICHE', 'FICHU', 'FICIN', 'FICOS', 'FICUS', 'FIDEL',
            'FIDGE', 'FIDOS', 'FIEFS', 'FIELD', 'FIEND', 'FIENT', 'FIERE', 'FIERS', 'FIERY', 'FIEST',
            'FIFED', 'FIFER', 'FIFES', 'FIFIS', 'FIFTH', 'FIFTY', 'FIGGY', 'FIGHT', 'FIGOS', 'FIKED',
            'FIKES', 'FILAR', 'FILCH', 'FILED', 'FILER', 'FILES', 'FILET', 'FILII', 'FILKS', 'FILLE',
            'FILLO', 'FILLS', 'FILLY', 'FILMI', 'FILMS', 'FILMY', 'FILOS', 'FILTH', 'FILUM', 'FINAL',
            'FINCA', 'FINCH', 'FINDS', 'FINED', 'FINER', 'FINES', 'FINGO', 'FINIS', 'FINKS', 'FINNY',
            'FINOS', 'FIORD', 'FIQHS', 'FIQUE', 'FIRED', 'FIRER', 'FIRES', 'FIRIE', 'FIRKS', 'FIRMS',
            'FIRNS', 'FIRRY', 'FIRST', 'FIRTH', 'FISCS', 'FISHY', 'FISKS', 'FISTS', 'FISTY', 'FITCH',
            'FITLY', 'FITNA', 'FITTE', 'FITTS', 'FIVER', 'FIVES', 'FIXED', 'FIXER', 'FIXES', 'FIXIT',
            'FIZZY', 'FJELD', 'FJORD', 'FLABS', 'FLACK', 'FLAFF', 'FLAGS', 'FLAIL', 'FLAIR', 'FLAKE',
            'FLAKS', 'FLAKY', 'FLAME', 'FLAMM', 'FLAMS', 'FLAMY', 'FLANE', 'FLANK', 'FLANS', 'FLAPS',
            'FLARE', 'FLARY', 'FLASH', 'FLASK', 'FLATS', 'FLAVA', 'FLAWN', 'FLAWS', 'FLAWY', 'FLAXY',
            'FLAYS', 'FLEAM', 'FLEAS', 'FLECK', 'FLEER', 'FLEES', 'FLEET', 'FLEGS', 'FLEME', 'FLESH',
            'FLEUR', 'FLEWS', 'FLEXI', 'FLEXO', 'FLEYS', 'FLICK', 'FLICS', 'FLIED', 'FLIER', 'FLIES',
            'FLIMS', 'FLIMP', 'FLING', 'FLINT', 'FLIPS', 'FLIRS', 'FLIRT', 'FLISK', 'FLITE', 'FLITS',
            'FLITT', 'FLOAT', 'FLOBS', 'FLOCK', 'FLOCS', 'FLOES', 'FLOGS', 'FLONG', 'FLOOD', 'FLOOR',
            'FLOPS', 'FLORA', 'FLORS', 'FLORY', 'FLOSH', 'FLOSS', 'FLOTA', 'FLOTE', 'FLOUR', 'FLOUT',
            'FLOWN', 'FLOWS', 'FLUBS', 'FLUED', 'FLUES', 'FLUEY', 'FLUFF', 'FLUID', 'FLUKE', 'FLUKS',
            'FLUKY', 'FLUME', 'FLUMP', 'FLUNG', 'FLUNK', 'FLUOR', 'FLURR', 'FLUSH', 'FLUTE', 'FLUTY',
            'FLUYT', 'FLYBY', 'FLYER', 'FLYPE', 'FLYTE', 'FOALS', 'FOAMS', 'FOAMY', 'FOCAL', 'FOCUS',
            'FOEHN', 'FOGEY', 'FOGGY', 'FOGIE', 'FOGLE', 'FOGOU', 'FOHNS', 'FOIDS', 'FOILS', 'FOINS',
            'FOIST', 'FOLDS', 'FOLEY', 'FOLIA', 'FOLIC', 'FOLIE', 'FOLIO', 'FOLKS', 'FOLKY', 'FOLLY',
            'FOMES', 'FONDA', 'FONDS', 'FONDU', 'FONES', 'FONLY', 'FONTS', 'FOODS', 'FOODY', 'FOOLS',
            'FOOTS', 'FOOTY', 'FORAM', 'FORAY', 'FORBS', 'FORBY', 'FORCE', 'FORDO', 'FORDS', 'FOREL',
            'FORES', 'FOREX', 'FORGE', 'FORGO', 'FORKS', 'FORKY', 'FORME', 'FORMS', 'FORNE', 'FORTE',
            'FORTH', 'FORTS', 'FORTY', 'FORUM', 'FORZA', 'FORZE', 'FOSSA', 'FOSSE', 'FOUAT', 'FOUDS',
            'FOUER', 'FOUET', 'FOULE', 'FOULS', 'FOUND', 'FOUNT', 'FOURS', 'FOUTH', 'FOVEA', 'FOWLS',
            'FOWTH', 'FOXED', 'FOXES', 'FOXIE', 'FOYER', 'FOYLE', 'FOYNE', 'FOYNS', 'FRABS', 'FRACK',
            'FRACT', 'FRAGS', 'FRAIL', 'FRAIM', 'FRAME', 'FRANC', 'FRANK', 'FRAPE', 'FRAPS', 'FRASS',
            'FRATE', 'FRATI', 'FRATS', 'FRAUD', 'FRAUS', 'FRAYS', 'FREAK', 'FREED', 'FREER', 'FREES',
            'FREET', 'FREIT', 'FREMD', 'FRENA', 'FREON', 'FRERE', 'FRESH', 'FRETS', 'FREUD', 'FRIAR',
            'FRIBS', 'FRIED', 'FRIER', 'FRIES', 'FRIGS', 'FRILL', 'FRISE', 'FRISK', 'FRIST', 'FRITH',
            'FRITS', 'FRITT', 'FRITZ', 'FRIZE', 'FRIZZ', 'FROCK', 'FROES', 'FROGS', 'FROND', 'FRONS',
            'FRONT', 'FRORE', 'FRORN', 'FRORY', 'FROSH', 'FROST', 'FROTH', 'FROWN', 'FROWS', 'FROWY',
            'FROZE', 'FRUGS', 'FRUIT', 'FRUMP', 'FRUNK', 'FRUSH', 'FRUST', 'FRYER', 'FUBAR', 'FUBBY',
            'FUBSY', 'FUCKS', 'FUCUS', 'FUDDY', 'FUDGE', 'FUDGY', 'FUELS', 'FUERO', 'FUFFS', 'FUFFY',
            'FUGAL', 'FUGGY', 'FUGIE', 'FUGIO', 'FUGLE', 'FUGLY', 'FUGUE', 'FUGUS', 'FUJIS', 'FULLS',
            'FULLY', 'FUMAR', 'FUMED', 'FUMER', 'FUMES', 'FUMET', 'FUNDI', 'FUNDS', 'FUNDY', 'FUNGI',
            'FUNGO', 'FUNGS', 'FUNKS', 'FUNKY', 'FUNNY', 'FURAL', 'FURAN', 'FURCA', 'FURLS', 'FUROL',
            'FUROR', 'FURRS', 'FURRY', 'FURTH', 'FURZE', 'FURZY', 'FUSED', 'FUSEE', 'FUSEL', 'FUSES',
            'FUSIL', 'FUSKS', 'FUSSY', 'FUSTS', 'FUSTY', 'FUTON', 'FUZED', 'FUZEE', 'FUZES', 'FUZIL',
            'FUZZY', 'FYCES', 'FYKED', 'FYKES', 'FYTTE',
            
            // G words
            'GABBA', 'GABBY', 'GABLE', 'GADDI', 'GADES', 'GADGE', 'GADID', 'GADIS', 'GADJE', 'GADJO',
            'GADSO', 'GAFFE', 'GAFFS', 'GAGED', 'GAGER', 'GAGES', 'GAIDS', 'GAINS', 'GAIRS', 'GAITA',
            'GAITS', 'GAITT', 'GAJOS', 'GALAH', 'GALAS', 'GALAX', 'GALEA', 'GALED', 'GALES', 'GALLS',
            'GALLY', 'GALOP', 'GALUT', 'GALVO', 'GAMAS', 'GAMAY', 'GAMBA', 'GAMBE', 'GAMBO', 'GAMBS',
            'GAMED', 'GAMER', 'GAMES', 'GAMEY', 'GAMIC', 'GAMIN', 'GAMMA', 'GAMME', 'GAMMY', 'GAMUT',
            'GANCH', 'GANDY', 'GANEF', 'GANEV', 'GANGS', 'GANJA', 'GANOF', 'GANTS', 'GAOLS', 'GAPED',
            'GAPER', 'GAPES', 'GAPEY', 'GAPOS', 'GAPPY', 'GARBE', 'GARBO', 'GARBS', 'GARCE', 'GARDA',
            'GARES', 'GARIS', 'GARMS', 'GARNI', 'GARRE', 'GARTH', 'GARUM', 'GASES', 'GASHY', 'GASPS',
            'GASPY', 'GASSY', 'GASTS', 'GATCH', 'GATED', 'GATER', 'GATES', 'GATHS', 'GATOR', 'GAUCY',
            'GAUDS', 'GAUDY', 'GAUGE', 'GAUJE', 'GAULT', 'GAUMS', 'GAUMY', 'GAUNT', 'GAUPS', 'GAURS',
            'GAUSS', 'GAUZE', 'GAUZY', 'GAVEL', 'GAVOT', 'GAWCY', 'GAWDS', 'GAWKS', 'GAWKY',
            'GAWPS', 'GAWSY', 'GAYAL', 'GAYER', 'GAYLY', 'GAZAL', 'GAZAR', 'GAZED', 'GAZER', 'GAZES',
            'GAZON', 'GAZOO', 'GEALS', 'GEANS', 'GEARE', 'GEARS', 'GEATS', 'GEBUR', 'GECKO', 'GECKS',
            'GEEKS', 'GEEKY', 'GEEPS', 'GEESE', 'GEEST', 'GEEKS', 'GEIST', 'GEITS', 'GELDS', 'GELEE',
            'GELID', 'GELLY', 'GELTS', 'GEMEL', 'GEMMA', 'GEMMY', 'GEMOT', 'GENAL', 'GENAS', 'GENES',
            'GENET', 'GENIC', 'GENIE', 'GENII', 'GENIP', 'GENNY', 'GENOA', 'GENOM', 'GENRE', 'GENRO',
            'GENTS', 'GENTY', 'GENUA', 'GENUS', 'GEODE', 'GEOID', 'GERAH', 'GERBE', 'GERES', 'GERLE',
            'GERMS', 'GERMY', 'GERNE', 'GESSE', 'GESSO', 'GESTE', 'GESTS', 'GETAS', 'GETUP', 'GEUMS',
            'GEYAN', 'GEYER', 'GHAST', 'GHATS', 'GHAUT', 'GHAZI', 'GHEES', 'GHEST', 'GHOST', 'GHOUL',
            'GHYLL', 'GIANT', 'GIBED', 'GIBEL', 'GIBER', 'GIBES', 'GIBLI', 'GIBUS', 'GIDDY', 'GIDDY',
            'GIFTS', 'GIGAS', 'GIGHE', 'GIGOT', 'GIGUE', 'GILAS', 'GILDS', 'GILET', 'GILLS', 'GILLY',
            'GILPY', 'GILTS', 'GIMME', 'GIMPS', 'GIMPY', 'GINCH', 'GINGE', 'GINGS', 'GINKS', 'GINNY',
            'GINZO', 'GIPON', 'GIPPO', 'GIPPY', 'GIPSY', 'GIRDS', 'GIRLS', 'GIRLY', 'GIRNS', 'GIRON',
            'GIROS', 'GIRRS', 'GIRSH', 'GIRTH', 'GIRTS', 'GISMO', 'GISMS', 'GISTS', 'GITCH', 'GITES',
            'GITTY', 'GIVEN', 'GIVER', 'GIVES', 'GIZMO', 'GLACE', 'GLADE', 'GLADS', 'GLADY', 'GLAIK',
            'GLAIR', 'GLAMS', 'GLAND', 'GLANS', 'GLARE', 'GLARY', 'GLASS', 'GLAUM', 'GLAUR', 'GLAUX',
            'GLAZE', 'GLAZY', 'GLEAM', 'GLEAN', 'GLEBA', 'GLEBE', 'GLEBY', 'GLEDE', 'GLEDS', 'GLEED',
            'GLEEK', 'GLEES', 'GLEET', 'GLEGG', 'GLEIS', 'GLENS', 'GLENT', 'GLEYS', 'GLIAL', 'GLIAS',
            'GLIBS', 'GLIDE', 'GLIFF', 'GLIFT', 'GLIKE', 'GLIME', 'GLIMS', 'GLINT', 'GLISK', 'GLITS',
            'GLITZ', 'GLOAM', 'GLOAT', 'GLOBE', 'GLOBI', 'GLOBS', 'GLOBY', 'GLOCK', 'GLODE', 'GLOGG',
            'GLOMS', 'GLOOM', 'GLOOP', 'GLOPS', 'GLORY', 'GLOSS', 'GLOST', 'GLOUT', 'GLOVE', 'GLOWS',
            'GLOZE', 'GLUED', 'GLUER', 'GLUES', 'GLUEY', 'GLUGS', 'GLUME', 'GLUMS', 'GLUON', 'GLUTE',
            'GLUTS', 'GLYPH', 'GNARL', 'GNARR', 'GNARS', 'GNASH', 'GNATS', 'GNAWN', 'GNAWS', 'GNOME',
            'GNOWS', 'GOADS', 'GOAFS', 'GOALS', 'GOARY', 'GOATS', 'GOATY', 'GOAVE', 'GOBAN', 'GOBAR',
            'GOBBI', 'GOBBO', 'GOBBY', 'GOBIS', 'GOBOS', 'GODET', 'GODLY', 'GODSO', 'GOELS', 'GOERS',
            'GOEST', 'GOETH', 'GOETY', 'GOFER', 'GOFFS', 'GOGGA', 'GOGOS', 'GOING', 'GOJIS', 'GOLDS',
            'GOLDY', 'GOLEM', 'GOLES', 'GOLFS', 'GOLLY', 'GOLPE', 'GOLPS', 'GOMBO', 'GOMER', 'GOMPA',
            'GONAD', 'GONCH', 'GONEF', 'GONER', 'GONGS', 'GONIA', 'GONIF', 'GONKS', 'GONNA', 'GONOF',
            'GONYS', 'GONZO', 'GOOBY', 'GOODS', 'GOODY', 'GOOEY', 'GOOFS', 'GOOFY', 'GOOKS', 'GOOKY',
            'GOOLD', 'GOOLS', 'GOOLY', 'GOONS', 'GOONY', 'GOOPS', 'GOOPY', 'GOORS', 'GOORY', 'GOOSE',
            'GOOSY', 'GOPAK', 'GOPHS', 'GOPIK', 'GORAL', 'GORAS', 'GORED', 'GORES', 'GORGE', 'GORIC',
            'GORMS', 'GORMY', 'GORPS', 'GORSE', 'GORSY', 'GOSHT', 'GOSSE', 'GOTCH', 'GOTHS', 'GOTHY',
            'GOTTA', 'GOUCH', 'GOUGE', 'GOUKS', 'GOURA', 'GOURD', 'GOURS', 'GOURY', 'GOUTS', 'GOUTY',
            'GOVAN', 'GOWAN', 'GOWDS', 'GOWFS', 'GOWKS', 'GOWLS', 'GOWNS', 'GOXES', 'GOYIM', 'GOYLE',
            'GRAAL', 'GRABS', 'GRACE', 'GRADE', 'GRADS', 'GRAFF', 'GRAFT', 'GRAIL', 'GRAIN', 'GRAIP',
            'GRAMA', 'GRAME', 'GRAMP', 'GRAMS', 'GRAND', 'GRANS', 'GRANT', 'GRAPE', 'GRAPH', 'GRAPY',
            'GRASP', 'GRASS', 'GRATE', 'GRAVE', 'GRAVS', 'GRAVY', 'GRAYS', 'GRAZE', 'GREAT', 'GREBE',
            'GREBO', 'GRECE', 'GREED', 'GREEK', 'GREEN', 'GREES', 'GREET', 'GREGE', 'GREGO', 'GREIN',
            'GRENS', 'GRESE', 'GREVE', 'GREWS', 'GREYS', 'GRICE', 'GRIDE', 'GRIDS', 'GRIEF', 'GRIFF',
            'GRIFT', 'GRIGS', 'GRIKE', 'GRILL', 'GRIME', 'GRIMY', 'GRIND', 'GRINS', 'GRIOT', 'GRIPE',
            'GRIPS', 'GRIPT', 'GRIPY', 'GRISE', 'GRISY', 'GRIST', 'GRISY', 'GRITH', 'GRITS', 'GRIZE',
            'GROAN', 'GROAT', 'GRODY', 'GROGS', 'GROIN', 'GROKS', 'GROMA', 'GRONE', 'GROOF', 'GROOM',
            'GROPE', 'GROSS', 'GROSZ', 'GROTS', 'GROUF', 'GROUP', 'GROUT', 'GROVE', 'GROWL', 'GROWN',
            'GROWS', 'GRRLS', 'GRRRL', 'GRUBS', 'GRUCE', 'GRUEL', 'GRUES', 'GRUFE', 'GRUFF', 'GRUME',
            'GRUMP', 'GRUNK', 'GRUNT', 'GRYCE', 'GRYDE', 'GRYKE', 'GRYPE', 'GRYPT', 'GUACO', 'GUANA',
            'GUANO', 'GUANS', 'GUARD', 'GUARS', 'GUAVA', 'GUCKS', 'GUCKY', 'GUDES', 'GUESS', 'GUEST',
            'GUFFS', 'GUGAS', 'GUIDE', 'GUIDS', 'GUILD', 'GUILE', 'GUILT', 'GUIMP', 'GUIRO', 'GUISE',
            'GULAG', 'GULAR', 'GULAS', 'GULCH', 'GULES', 'GULET', 'GULFS', 'GULFY', 'GULLS', 'GULLY',
            'GULPH', 'GULPS', 'GULPY', 'GUMBO', 'GUMMA', 'GUMMY', 'GUMPS', 'GUNDY', 'GUNGE', 'GUNGY',
            'GUNKS', 'GUNKY', 'GUNNY', 'GUPPY', 'GUQIN', 'GURDY', 'GURGE', 'GURLS', 'GURLY', 'GURNS',
            'GURRY', 'GURSH', 'GURUS', 'GUSHY', 'GUSLA', 'GUSLE', 'GUSLI', 'GUSSY', 'GUSTO', 'GUSTS',
            'GUSTY', 'GUTSY', 'GUTTA', 'GUTTY', 'GUYED', 'GUYLE', 'GUYOT', 'GUYSE', 'GWINE', 'GYALS',
            'GYANS', 'GYBED', 'GYBES', 'GYELD', 'GYMPS', 'GYNAE', 'GYNIE', 'GYNNY', 'GYNOS', 'GYOZA',
            'GYPPO', 'GYPPY', 'GYPSY', 'GYRAL', 'GYRANT', 'GYRATE', 'GYRES', 'GYRI', 'GYRO', 'GYRON',
            'GYROS', 'GYRUS', 'GYTES', 'GYVED', 'GYVES',
            
            // H words
            'HAAFS', 'HAARS', 'HABIT', 'HABLE', 'HABUS', 'HACEK', 'HACKS', 'HADAL', 'HADED', 'HADES',
            'HADJI', 'HADST', 'HAEMS', 'HAETS', 'HAFFS', 'HAFIZ', 'HAFTS', 'HAGGS', 'HAHAS', 'HAICK',
            'HAIKA', 'HAIKS', 'HAIKU', 'HAILS', 'HAILY', 'HAINS', 'HAINT', 'HAIRS', 'HAIRY', 'HAITH',
            'HAJES', 'HAJIS', 'HAJJI', 'HAKAM', 'HAKAS', 'HAKEA', 'HAKES', 'HAKIM', 'HAKUS', 'HALAL',
            'HALED', 'HALER', 'HALES', 'HALFA', 'HALFS', 'HALID', 'HALLO', 'HALLS', 'HALMA', 'HALON',
            'HALOS', 'HALSE', 'HALTS', 'HALVA', 'HALVE', 'HALWA', 'HAMAL', 'HAMBA', 'HAMED', 'HAMES',
            'HAMMY', 'HAMZA', 'HANAP', 'HANCE', 'HANCH', 'HANDS', 'HANDY', 'HANGI', 'HANGS', 'HANKS',
            'HANKY', 'HANSA', 'HANSE', 'HANTS', 'HAOLE', 'HAOMA', 'HAPAX', 'HAPLY', 'HAPPY', 'HAPUS',
            'HARAM', 'HARDS', 'HARDY', 'HARED', 'HAREM', 'HARES', 'HARIM', 'HARKS', 'HARLS', 'HARMS',
            'HARNS', 'HAROS', 'HARPS', 'HARPY', 'HARRY', 'HARSH', 'HARTS', 'HASHY', 'HASKS', 'HASPS',
            'HASTA', 'HASTE', 'HASTY', 'HATCH', 'HATED', 'HATER', 'HATES', 'HAUGH', 'HAULM', 'HAULS',
            'HAUNT', 'HAUSE', 'HAUTE', 'HAVEN', 'HAVER', 'HAVES', 'HAVOC', 'HAWED', 'HAWKS', 'HAWMS',
            'HAWSE', 'HAYED', 'HAYER', 'HAYEY', 'HAYLE', 'HAZAN', 'HAZED', 'HAZEL', 'HAZER', 'HAZES',
            'HEADS', 'HEADY', 'HEALD', 'HEALS', 'HEAME', 'HEAPS', 'HEAPY', 'HEARD', 'HEARE', 'HEARS',
            'HEART', 'HEAST', 'HEATH', 'HEATS', 'HEAVE', 'HEAVY', 'HEBES', 'HECHT', 'HECKS', 'HEDER',
            'HEDGE', 'HEDGY', 'HEEDS', 'HEEDY', 'HEELS', 'HEEZE', 'HEFTE', 'HEFTS', 'HEFTY', 'HEIDS',
            'HEIGH', 'HEILS', 'HEIRS', 'HEIST', 'HEJAB', 'HEJRA', 'HELED', 'HELES', 'HELIO', 'HELIX',
            'HELLO', 'HELLS', 'HELMS', 'HELOS', 'HELOT', 'HELPS', 'HELVE', 'HEMAL', 'HEMES', 'HEMIC',
            'HEMIN', 'HEMPS', 'HEMPY', 'HENCE', 'HENCH', 'HENDS', 'HENGE', 'HENNA', 'HENNY', 'HENRY',
            'HENTS', 'HEPAR', 'HERBS', 'HERBY', 'HERDS', 'HERES', 'HERLS', 'HERMA', 'HERMS', 'HERNE',
            'HERNS', 'HERON', 'HEROS', 'HERRY', 'HERSE', 'HERTZ', 'HERYE', 'HESPS', 'HESTS', 'HETES',
            'HETHS', 'HEUCH', 'HEUGH', 'HEVEA', 'HEWED', 'HEWER', 'HEWGH', 'HEXAD', 'HEXED', 'HEXES',
            'HEXYL', 'HEYED', 'HIANT', 'HICKS', 'HIDED', 'HIDER', 'HIDES', 'HIEMS', 'HIGHS', 'HIGHT',
            'HIJAB', 'HIJRA', 'HIKED', 'HIKER', 'HIKES', 'HIKOI', 'HILAR', 'HILCH', 'HILLO', 'HILLS',
            'HILLY', 'HILTS', 'HILUM', 'HILUS', 'HIMBO', 'HINAU', 'HINDS', 'HINGE', 'HINGS', 'HINKY',
            'HINNY', 'HINTS', 'HIOIS', 'HIPLY', 'HIPPO', 'HIPPY', 'HIRED', 'HIREE', 'HIRER', 'HIRES',
            'HISSY', 'HISTS', 'HITCH', 'HITHE', 'HIVED', 'HIVER', 'HIVES', 'HIZEN', 'HOAED', 'HOAGY',
            'HOARD', 'HOARS', 'HOARY', 'HOAST', 'HOBBY', 'HOBOS', 'HOCKS', 'HOCUS', 'HODAD', 'HODGE',
            'HODJA', 'HOERS', 'HOGAN', 'HOGEN', 'HOGGS', 'HOGHS', 'HOHED', 'HOICK', 'HOIED', 'HOIKS',
            'HOING', 'HOISE', 'HOIST', 'HOKAS', 'HOKED', 'HOKES', 'HOKEY', 'HOKIS', 'HOKKU', 'HOKUM',
            'HOLDS', 'HOLED', 'HOLES', 'HOLEY', 'HOLKS', 'HOLLA', 'HOLLO', 'HOLLY', 'HOLME', 'HOLMS',
            'HOLON', 'HOLOS', 'HOLTS', 'HOMAS', 'HOMED', 'HOMER', 'HOMES', 'HOMEY', 'HOMIE', 'HOMME',
            'HOMOS', 'HONAN', 'HONDA', 'HONDS', 'HONED', 'HONER', 'HONES', 'HONEY', 'HONGI', 'HONGS',
            'HONKS', 'HONKY', 'HONOR', 'HOOCH', 'HOODS', 'HOODY', 'HOOEY', 'HOOFS', 'HOOKA', 'HOOKS',
            'HOOKY', 'HOOLY', 'HOONS', 'HOOPS', 'HOORD', 'HOORS', 'HOOSH', 'HOOTS', 'HOOTY', 'HOOVE',
            'HOPED', 'HOPER', 'HOPES', 'HOPPY', 'HORAH', 'HORAL', 'HORAS', 'HORDE', 'HORIS', 'HORME',
            'HORNS', 'HORNY', 'HORSE', 'HORST', 'HORSY', 'HOSED', 'HOSEL', 'HOSEN', 'HOSER', 'HOSES',
            'HOSTA', 'HOSTS', 'HOTCH', 'HOTEL', 'HOTEN', 'HOTLY', 'HOTTY', 'HOUFF', 'HOUFS', 'HOUGH',
            'HOUND', 'HOURI', 'HOURS', 'HOUSE', 'HOUTS', 'HOVEA', 'HOVED', 'HOVEL', 'HOVEN', 'HOVER',
            'HOVES', 'HOWBE', 'HOWDY', 'HOWES', 'HOWFF', 'HOWFS', 'HOWKS', 'HOWLS', 'HOWRE', 'HOWSO',
            'HOWTO', 'HOXED', 'HOXES', 'HOYAS', 'HOYED', 'HOYLE', 'HUBBY', 'HUCKS', 'HUDNA', 'HUDUD',
            'HUERS', 'HUFFS', 'HUFFY', 'HUGER', 'HUGGS', 'HUHUS', 'HUIAS', 'HULAS', 'HULES', 'HULKS',
            'HULKY', 'HULLO', 'HULLS', 'HUMAN', 'HUMAS', 'HUMBO', 'HUMFS', 'HUMIC', 'HUMID', 'HUMOR',
            'HUMPH', 'HUMPS', 'HUMPY', 'HUMUS', 'HUNCH', 'HUNKS', 'HUNKY', 'HUNTS', 'HURDS', 'HURLS',
            'HURLY', 'HURRA', 'HURRY', 'HURST', 'HURTS', 'HUSHY', 'HUSKS', 'HUSKY', 'HUSOS', 'HUSSY',
            'HUTCH', 'HUTIA', 'HUZZA', 'HUZZY', 'HWYLS', 'HYDRA', 'HYDRO', 'HYENA', 'HYENS', 'HYGGE',
            'HYING', 'HYKES', 'HYLAS', 'HYLEG', 'HYLES', 'HYLIC', 'HYMNS', 'HYNDE', 'HYOID', 'HYPED',
            'HYPER', 'HYPES', 'HYPHA', 'HYPHY', 'HYPOS', 'HYRAX', 'HYSON', 'HYTHE',
        ];
        
        this.validWords = [...this.commonWords];
        
        this.initializeElements();
        this.setupEventListeners();
        this.loadStats();
        this.initializeGame();
    }

    initializeElements() {
        this.gameBoard = document.getElementById('gameBoard');
        this.keyboard = document.getElementById('keyboard');
        this.message = document.getElementById('message');
        this.attemptsLeft = document.getElementById('attemptsLeft');
        this.gamesWon = document.getElementById('gamesWon');
        this.gamesPlayed = document.getElementById('gamesPlayed');
        this.winStreak = document.getElementById('winStreak');
        this.dailyMode = document.getElementById('dailyMode');
        this.infiniteMode = document.getElementById('infiniteMode');
        this.newGameButton = document.getElementById('newGameButton');
    }

    setupEventListeners() {
        this.dailyMode.addEventListener('click', () => this.setGameMode('daily'));
        this.infiniteMode.addEventListener('click', () => this.setGameMode('infinite'));
        this.newGameButton.addEventListener('click', () => this.startNewGame());
        
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
    }

    setGameMode(mode) {
        this.gameMode = mode;
        this.dailyMode.classList.toggle('active', mode === 'daily');
        this.infiniteMode.classList.toggle('active', mode === 'infinite');
        this.startNewGame();
    }

    initializeGame() {
        this.createGameBoard();
        this.createKeyboard();
        this.startNewGame();
    }

    createGameBoard() {
        this.gameBoard.innerHTML = '';
        for (let row = 0; row < this.maxAttempts; row++) {
            const guessRow = document.createElement('div');
            guessRow.className = 'guess-row';
            guessRow.id = `row-${row}`;
            
            for (let col = 0; col < this.wordLength; col++) {
                const tile = document.createElement('div');
                tile.className = 'letter-tile';
                tile.id = `tile-${row}-${col}`;
                guessRow.appendChild(tile);
            }
            
            this.gameBoard.appendChild(guessRow);
        }
    }

    createKeyboard() {
        const keyboardLayout = [
            ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
            ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
            ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE']
        ];
        
        this.keyboard.innerHTML = '';
        
        keyboardLayout.forEach(row => {
            const keyboardRow = document.createElement('div');
            keyboardRow.className = 'keyboard-row';
            
            row.forEach(key => {
                const keyButton = document.createElement('button');
                keyButton.className = key.length > 1 ? 'key wide' : 'key';
                keyButton.textContent = key === 'BACKSPACE' ? '⌫' : key;
                keyButton.dataset.key = key;
                keyButton.addEventListener('click', () => this.handleKeyClick(key));
                keyboardRow.appendChild(keyButton);
            });
            
            this.keyboard.appendChild(keyboardRow);
        });
    }

    startNewGame() {
        this.currentRow = 0;
        this.currentCol = 0;
        this.currentWord = '';
        this.gameActive = true;
        this.keyboardState = {};
        
        // Clear the board
        for (let row = 0; row < this.maxAttempts; row++) {
            for (let col = 0; col < this.wordLength; col++) {
                const tile = document.getElementById(`tile-${row}-${col}`);
                tile.textContent = '';
                tile.className = 'letter-tile';
            }
        }
        
        // Reset keyboard
        document.querySelectorAll('.key').forEach(key => {
            key.className = key.classList.contains('wide') ? 'key wide' : 'key';
            key.style.visibility = 'visible';
            key.disabled = false;
        });
        
        // Select target word
        if (this.gameMode === 'daily') {
            this.targetWord = this.getDailyWord();
            this.updateMessage("Solve today's daily Woordle!", "info");
        } else {
            this.targetWord = this.getRandomWord();
            this.updateMessage("Guess the 5-letter word!", "info");
        }
        
        this.updateAttemptsDisplay();
        this.newGameButton.style.display = 'none';
        
        console.log('Target word:', this.targetWord); // For debugging
    }

    getDailyWord() {
        // Use today's date as seed for consistent daily word
        const today = new Date();
        const dateString = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
        const seed = this.hashCode(dateString);
        const index = Math.abs(seed) % this.commonWords.length;
        return this.commonWords[index];
    }

    getRandomWord() {
        return this.commonWords[Math.floor(Math.random() * this.commonWords.length)];
    }

    hashCode(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash;
    }

    handleKeyPress(e) {
        if (!this.gameActive) return;
        
        const key = e.key.toUpperCase();
        
        // Don't allow typing disabled (absent) letters
        if (key.match(/[A-Z]/) && key.length === 1) {
            const keyElement = document.querySelector(`[data-key="${key}"]`);
            if (keyElement && keyElement.disabled) return;
        }
        
        if (key === 'ENTER') {
            this.submitGuess();
        } else if (key === 'BACKSPACE') {
            this.deleteLetter();
        } else if (key.match(/[A-Z]/) && key.length === 1) {
            this.addLetter(key);
        }
    }

    handleKeyClick(key) {
        if (!this.gameActive) return;
        
        // Don't allow clicking on disabled (absent) keys
        const keyElement = document.querySelector(`[data-key="${key}"]`);
        if (keyElement && keyElement.disabled) return;
        
        if (key === 'ENTER') {
            this.submitGuess();
        } else if (key === 'BACKSPACE') {
            this.deleteLetter();
        } else {
            this.addLetter(key);
        }
    }

    addLetter(letter) {
        if (this.currentCol < this.wordLength) {
            const tile = document.getElementById(`tile-${this.currentRow}-${this.currentCol}`);
            tile.textContent = letter;
            tile.classList.add('filled');
            this.currentWord += letter;
            this.currentCol++;
        }
    }

    deleteLetter() {
        if (this.currentCol > 0) {
            this.currentCol--;
            const tile = document.getElementById(`tile-${this.currentRow}-${this.currentCol}`);
            tile.textContent = '';
            tile.classList.remove('filled');
            this.currentWord = this.currentWord.slice(0, -1);
        }
    }

    submitGuess() {
        if (this.currentWord.length !== this.wordLength) {
            this.updateMessage("Not enough letters!", "error");
            this.playSound('error');
            return;
        }
        
        if (!this.isValidWord(this.currentWord)) {
            this.updateMessage("Not a valid word!", "error");
            this.playSound('error');
            this.shakeRow(this.currentRow);
            return;
        }
        
        // Check the guess and process results
        this.checkGuess();
        
        if (this.currentWord === this.targetWord) {
            setTimeout(() => {
                this.handleWin();
            }, this.wordLength * 100 + 200);
        } else if (this.currentRow >= this.maxAttempts - 1) {
            setTimeout(() => {
                this.handleLoss();
            }, this.wordLength * 100 + 200);
        } else {
            // Move to next row after animation completes
            setTimeout(() => {
                this.currentRow++;
                this.currentCol = 0;
                this.currentWord = '';
                this.updateAttemptsDisplay();
            }, this.wordLength * 100 + 100);
        }
    }

    isValidWord(word) {
        return this.validWords.includes(word);
    }

    checkGuess() {
        const targetLetters = [...this.targetWord];
        const guessLetters = [...this.currentWord];
        const results = new Array(this.wordLength).fill('absent');
        
        // First pass: mark correct positions
        for (let i = 0; i < this.wordLength; i++) {
            if (guessLetters[i] === targetLetters[i]) {
                results[i] = 'correct';
                targetLetters[i] = null;
                guessLetters[i] = null;
            }
        }
        
        // Second pass: mark present letters
        for (let i = 0; i < this.wordLength; i++) {
            if (guessLetters[i] && targetLetters.includes(guessLetters[i])) {
                results[i] = 'present';
                targetLetters[targetLetters.indexOf(guessLetters[i])] = null;
            }
        }
        
        // Animate tiles and update keyboard state
        for (let i = 0; i < this.wordLength; i++) {
            const letter = this.currentWord[i];
            const result = results[i];
            
            setTimeout(() => {
                const tile = document.getElementById(`tile-${this.currentRow}-${i}`);
                tile.classList.add(result);
                
                // Update keyboard state - prioritize correct > present > absent
                if (!this.keyboardState[letter] || 
                    (this.keyboardState[letter] !== 'correct' && result === 'correct') ||
                    (this.keyboardState[letter] === 'absent' && result === 'present')) {
                    this.keyboardState[letter] = result;
                }
            }, i * 100);
        }
        
        // Update keyboard after all tiles are processed
        setTimeout(() => {
            this.updateKeyboard();
        }, this.wordLength * 100);
        
        this.playSound('flip');
    }

    updateKeyboard() {
        document.querySelectorAll('.key').forEach(key => {
            const letter = key.dataset.key;
            if (this.keyboardState[letter]) {
                key.classList.remove('correct', 'present', 'absent');
                
                if (this.keyboardState[letter] === 'absent') {
                    // Make absent letters disappear from keyboard
                    key.style.visibility = 'hidden';
                    key.disabled = true;
                } else {
                    // Show correct and present letters normally
                    key.classList.add(this.keyboardState[letter]);
                    key.style.visibility = 'visible';
                    key.disabled = false;
                }
            }
        });
    }

    handleWin() {
        this.gameActive = false;
        const attempts = this.currentRow + 1;
        this.updateMessage(`🎉 Excellent! You got it in ${attempts} attempt${attempts === 1 ? '' : 's'}!`, "success");
        this.playSound('win');
        this.createConfetti();
        
        // Update stats
        const stats = this.getStats();
        stats.gamesWon++;
        stats.gamesPlayed++;
        stats.currentStreak++;
        stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak);
        this.saveStats(stats);
        this.updateStatsDisplay();
        
        setTimeout(() => {
            this.newGameButton.style.display = 'inline-block';
        }, 2000);
    }

    handleLoss() {
        this.gameActive = false;
        this.updateMessage(`💀 Game Over! The word was "${this.targetWord}".`, "error");
        this.playSound('lose');
        
        // Update stats
        const stats = this.getStats();
        stats.gamesPlayed++;
        stats.currentStreak = 0;
        this.saveStats(stats);
        this.updateStatsDisplay();
        
        setTimeout(() => {
            this.newGameButton.style.display = 'inline-block';
        }, 2000);
    }

    updateMessage(text, type) {
        this.message.innerHTML = `<p>${text}</p>`;
        this.message.className = `message ${type}`;
    }

    updateAttemptsDisplay() {
        const remaining = this.maxAttempts - this.currentRow;
        this.attemptsLeft.textContent = `${remaining} attempt${remaining === 1 ? '' : 's'} left`;
        
        if (remaining <= 2) {
            this.attemptsLeft.style.color = '#ff4444';
        } else {
            this.attemptsLeft.style.color = '#ffeb3b';
        }
    }

    shakeRow(row) {
        const rowElement = document.getElementById(`row-${row}`);
        rowElement.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
            rowElement.style.animation = '';
        }, 500);
    }

    createConfetti() {
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f7dc6f', '#bb8fce'];
        
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.style.position = 'fixed';
                confetti.style.width = '10px';
                confetti.style.height = '10px';
                confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.left = Math.random() * 100 + '%';
                confetti.style.top = '-10px';
                confetti.style.borderRadius = '50%';
                confetti.style.pointerEvents = 'none';
                confetti.style.zIndex = '9999';
                confetti.style.animation = 'confettiFall 3s linear forwards';
                
                document.body.appendChild(confetti);
                
                setTimeout(() => {
                    if (confetti.parentNode) {
                        confetti.parentNode.removeChild(confetti);
                    }
                }, 3000);
            }, i * 50);
        }
    }

    playSound(type) {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        let frequency, duration;
        
        switch(type) {
            case 'win':
                frequency = 523.25;
                duration = 0.5;
                break;
            case 'lose':
                frequency = 220;
                duration = 0.8;
                break;
            case 'flip':
                frequency = 330;
                duration = 0.2;
                break;
            case 'error':
                frequency = 200;
                duration = 0.3;
                break;
            default:
                frequency = 440;
                duration = 0.2;
        }
        
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
    }

    getStats() {
        const defaultStats = {
            gamesWon: 0,
            gamesPlayed: 0,
            currentStreak: 0,
            maxStreak: 0
        };
        
        const saved = localStorage.getItem('woordle-stats');
        return saved ? JSON.parse(saved) : defaultStats;
    }

    saveStats(stats) {
        localStorage.setItem('woordle-stats', JSON.stringify(stats));
    }

    loadStats() {
        this.updateStatsDisplay();
    }

    updateStatsDisplay() {
        const stats = this.getStats();
        this.gamesWon.textContent = stats.gamesWon;
        this.gamesPlayed.textContent = stats.gamesPlayed;
        this.winStreak.textContent = stats.currentStreak;
    }
}

// CSS for confetti animation
const style = document.createElement('style');
style.textContent = `
    @keyframes confettiFall {
        to {
            transform: translateY(100vh) rotate(360deg);
        }
    }
`;
document.head.appendChild(style);

// Initialize game when page loads
window.addEventListener('load', () => {
    new WoordleGame();
});