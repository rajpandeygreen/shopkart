/* ============================================================
   ShopKart – Smart Search (multi-language + live suggestions)
   ------------------------------------------------------------
   Works fully offline with zero dependencies.

   1. INDIAN LANGUAGES
      A shopper can type in Hindi, Tamil, Bengali, Telugu,
      Marathi, Kannada, Malayalam, Gujarati, Punjabi, Odia or
      Urdu and still find the right products. Every word is
      translated to its English shopping term before matching.

   2. LIVE SUGGESTIONS
      As the user types, a dropdown shows matching categories,
      brands, products and quick "search for ..." terms.
   ============================================================ */

/* ---------- 1. DICTIONARY -------------------------------------------
   key   = English shopping term (what the catalog uses)
   value = array of words in Indian languages + common spellings
   ------------------------------------------------------------------ */
const SEARCH_DICT = {
  /* --- categories --- */
  mobile: ["मोबाइल", "मोबाईल", "फोन", "मोबाइल फोन", "செல்பேசி", "மொபைல்", "போன்", "মোবাইল", "ফোন", "మొబైల్", "ఫోన్", "मोबाईल फोन", "ಮೊಬೈಲ್", "ഫോൺ", "મોબાઇલ", "ਫੋਨ", "ମୋବାଇଲ", "موبائل", "فون"],
  electronics: ["इलेक्ट्रॉनिक्स", "इलेक्ट्रानिक", "எலக்ட்ரானிக்ஸ்", "ইলেকট্রনিক্স", "ఎలక్ట్రానిక్స్", "इलेक्ट्रॉनिक", "ಎಲೆಕ್ಟ್ರಾನಿಕ್ಸ್", "ഇലക്ട്രോണിക്സ്", "ઇલેક્ટ્રોનિક્સ", "ਇਲੈਕਟ੍ਰਾਨਿਕਸ", "ଇଲେକ୍ଟ୍ରୋନିକ୍ସ", "الیکٹرانکس"],
  fashion: ["फैशन", "कपड़े", "कपडे", "वस्त्र", "பேஷன்", "ஆடை", "உடை", "ফ্যাশন", "পোশাক", "ఫ్యాషన్", "దుస్తులు", "ಫ್ಯಾಷನ್", "ಬಟ್ಟೆ", "ഫാഷൻ", "ફેશન", "ਕੱਪੜੇ", "ଫ୍ୟାଶନ", "فیشن"],
  home: ["घर", "होम", "गृह", "वाटी", "भांडी", "வீடு", "গৃহ", "বাড়ি", "ఇల్లు", "ಮನೆ", "വീട്", "ઘર", "ਘਰ", "ଘର", "گھر"],
  appliances: ["उपकरण", "मशीन", "यंत्र", "சாதனம்", "যন্ত্র", "పరికరాలు", "ಯಂತ್ರ", "ഉപകരണങ്ങൾ", "સાધનો", "ਉਪਕਰਣ", "ଯନ୍ତ୍ର", "سامان"],
  beauty: ["सौंदर्य", "ब्यूटी", "प्रसाधन", "அழகு", "সৌন্দর্য", "అందం", "ಸೌಂದರ್ಯ", "സൗന്ദര്യ", "સૌંદર્ય", "ਸੁੰਦਰਤਾ", "ସୌନ୍ଦର୍ଯ୍ୟ", "خوبصورتی", "टॉय", "खिलौने", "खेलौना", "பொம்மை", "খেলনা", "బొమ్మలు", "ಆಟಿಕೆ", "കളിപ്പാട്ടം", "રમકડું", "ਖਿਡੌਣੇ", "ଖେଳନା"],
  grocery: ["किराना", "किराने", "राशन", "सामान", "மளிகை", "মুদি", "సరుకు", "ಸರಕು", "പലചരക്ക്", "કરિયાણું", "ਕਰਿਆਨਾ", "ମୁଦି", "راشن", "पंसारी"],
  travel: ["यात्रा", "ट्रैवल", "सफर", "प्रवास", "பயணம்", "ভ্রমণ", "ప్రయాణం", "ಪ್ರಯಾಣ", "യാത്ര", "પ્રવાસ", "ਸਫ਼ਰ", "ଭ୍ରମଣ", "سفر"],

  /* --- products --- */
  phone: ["फोन", "मोबाइल", "फ़ोन", "போன்", "ফোন", "ఫోన్", "ಮೊಬೈಲ್", "ഫോൺ", "ફોન", "ਫੋਨ", "ଫୋନ", "فون", "موبائل"],
  smartphone: ["स्मार्टफोन", "फोन", "स्मார்ட்போன்", "ஸ்மார்ட்போன்", "স্মার্টফোন", "స్మార్ట్ఫోన్", "ಸ್ಮಾರ್ಟ್ಫೋನ್", "സ്മാർട്ട്ഫോൺ", "સ્માર્ટફોન", "ਸਮਾਰਟਫੋਨ"],
  laptop: ["लैपटॉप", "लैपटाप", "कंप्यूटर", "संगणक", "लैपटॉप संगणक", "மடிக்கணினி", "ল্যাপটপ", "คอม", "ల్యాప్టాప్", "ಲ್ಯಾಪ್ಟಾಪ್", "ലാപ്ടോപ്പ്", "લેપટોપ", "ਲੈਪਟਾਪ", "ଲ୍ୟାପଟପ", "لیپ ٹاپ"],
  computer: ["कंप्यूटर", "संगणक", "कम्प्यूटर", "கணினி", "কম্পিউটার", "কম্পিউটার", "కంప్యూటర్", "ಕಂಪ್ಯೂಟರ್", "കമ്പ്യൂട്ടർ", "કમ્પ્યુટર", "ਕੰਪਿਊਟਰ", "کمپیوٹر"],
  earphone: ["ईयरफोन", "इयरफ़ोन", "हेडफोन", "इयरबड्स", "कान", "மூடி", "ইয়ারফোন", "హెడ్ఫోన్", "ಇಯರ್ಫೋನ್", "ഇയർഫോൺ", "ઇયરફોન", "ਈਅਰਫੋਨ", "ایئر فون"],
  headphone: ["हेडफोन", "हेडफ़ोन", "ईयरफोन", "ஹெட்ஃபோன்", "হেডফোন", "హెడ్ఫోన్", "ಹೆಡ್ಫೋನ್", "ഹെഡ്ഫോൺ", "હેડફોન", "ਹੈੱਡਫੋਨ", "ہیڈ فون"],
  earbuds: ["इयरबड्स", "ईयरबड्स", "इयरफोन", "காது", "ইয়ারবাড", "ఇయర్బడ్స్", "ಇಯರ್‌ಬಡ್ಸ್", "ഇയർബഡ്സ്", "ઇયરબડ્સ", "ਈਅਰਬਡ"],
  speaker: ["स्पीकर", "ध्वनि विस्तारक", "ஸ்பீக்கர்", "স্পিকার", "స్పీకర్", "ಸ್ಪೀಕರ್", "സ്പീക്കർ", "સ્પીકર", "ਸਪੀਕਰ", "ସ୍ପିକର", "اسپیکر"],
  watch: ["घड़ी", "वॉच", "घडी", "கடிகாரம்", "ঘড়ি", "వాచ్", "ಗಡಿಯಾರ", "വാച്ച്", "ઘડિયાળ", "ਘੜੀ", "ଘଡ଼ି", "گھڑی"],
  camera: ["कैमरा", "कॅमेरा", "கேமரா", "ক্যামেরা", "కెమెరా", "ಕ್ಯಾಮೆರಾ", "ക്യാമറ", "કેમેરા", "ਕੈਮਰਾ", "କ୍ୟାମେରା", "کیمرہ"],
  tv: ["टीवी", "टेलीविजन", "தொலைக்காட்சி", "টিভি", "టీవీ", "ಟಿವಿ", "ടിവി", "ટીવી", "ਟੀਵੀ", "ଟିଭି", "ٹی وی"],
  shirt: ["शर्ट", "कमीज", "कमीज़", "சட்டை", "শার্ট", "చొక్కా", "ಶರ್ಟ್", "ഷർട്ട്", "શર્ટ", "ਕਮੀਜ਼", "ଶାର୍ଟ", "شرٹ", "قمیض"],
  kurta: ["कुर्ता", "कुर्ती", "kurta", "kurti", "kurthi", "குர்தா", "কুর্তা", "కుర్తా", "ಕುರ್ತಾ", "കുർത്ത", "કુર્તા", "ਕੁੜਤਾ", "କୁର୍ତା", "کرتا"],
  dress: ["ड्रेस", "पोशाक", "फ्रॉक", "ஆடை", "পোশাক", "దుస్తులు", "ಉಡುಪು", "വസ്ത്രം", "ડ્રેસ", "ਪਹਿਰਾਵਾ", "ପୋଷାକ", "لباس"],
  shoe: ["जूता", "जूते", "चप्पल", "chapal", "chappal", "juta", "joota", "செருப்பு", "কুঁচ", "షూ", "ಶೂ", "ഷൂ", "જૂતા", "ਜੁੱਤੇ", "ଜୋତା", "جوتا", "جوتے"],
  shoes: ["जूते", "जूता", "फुटवियर", "footwear", "shoes", "sneaker", "sneakers", "காலணி", "জুতা", "బూట్లు", "ಶೂಗಳು", "ഷൂസ്", "પગરખાં", "ਜੁੱਤੇ", "ଜୋତା", "جوتے"],
  sneakers: ["स्नीकर्स", "जूते", "दौड़", "स्पोर्ट्स शू", "ஸ்னீக்கர்ஸ்", "স্নিকার্স", "స్నీకర్స్", "ಸ್ನೀಕರ್ಸ್", "સ્નીકર્સ", "ਸਨੀਕਰਜ਼"],
  bag: ["बैग", "थैला", "झोला", "பை", "ব্যাগ", "బ్యాగ్", "ಬ್ಯಾಗ್", "ബാഗ്", "બેગ", "ਬੈਗ", "ବ୍ୟାଗ", "بیگ"],
  fridge: ["फ्रिज", "रेफ्रिजरेटर", "शीतक", "பிரிட்ஜ்", "ফ্রিজ", "ఫ్రిజ్", "ಫ್ರಿಡ್ಜ್", "ഫ്രിഡ്ജ്", "ફ્રિજ", "ਫਰਿੱਜ", "ଫ୍ରିଜ", "فریج"],
  washing: ["वाशिंग मशीन", "कपड़े धोने", "धुलाई", "वॉशिंग", "சலவை", "ওয়াশিং", "వాషింగ్", "ವಾಷಿಂಗ್", "വാഷിംഗ്", "વોશિંગ", "ਵਾਸ਼ਿੰਗ", "ୱାସିଂ", "واشنگ"],
  machine: ["मशीन", "यंत्र", "இயந்திரம்", "মেশিন", "యంత్రం", "ಯಂತ್ರ", "മെഷീൻ", "મશીન", "ਮਸ਼ੀਨ", "ମେସିନ", "مشین"],
  ac: ["एसी", "एयर कंडीशनर", "वातानुकूलक", "குளிர்சாதன", "এসি", "ఏసీ", "ಎಸಿ", "എസി", "એસી", "ਏਸੀ", "ଏସି", "اے سی"],
  cooler: ["कूलर", "쿨ر के"],
  mixer: ["मिक्सर", "ग्राइंडर", "मिक्सी", "मिश्रण", "மிக்ஸி", "মিক্সার", "మిక్సర్", "ಮಿಕ್ಸರ್", "മിക്സർ", "મિક્સર", "ਮਿਕਸਰ", "ମିକ୍ସର", "مکسر"],
  grinder: ["ग्राइंडर", "मिक्सर", "मिक्सी", "पीसने", "அரவை", "গ্রাইন্ডার", "గ్రైండర్", "ಗ್ರೈಂಡರ್", "ഗ്രൈൻഡർ", "ગ્રાઇન્ડર", "ਗ੍ਰਾਈਂਡਰ"],
  fan: ["पंखा", "फैन", "பங்கா", "ফ্যান", "ఫ్యాన్", "ಫ್ಯಾನ್", "ഫാൻ", "પંખો", "ਪੱਖਾ", "ପଙ୍ଖା", "پنکھا"],
  lamp: ["लैंप", "दीप", "बत्ती", "விளக்கு", "বাতি", "దీపం", "ದೀಪ", "വിളക്ക്", "દીવો", "ਦੀਵਾ", "ଦୀପ", "چراغ"],
  light: ["लाइट", "प्रकाश", "बत्ती", "விளக்கு", "আলো", "లైట్", "ಬೆಳಕು", "വെളിച്ചം", "લાઇટ", "ਰੋਸ਼ਨੀ", "ଆଲୋ", "روشنی"],
  table: ["टेबल", "मेज", "मेज़", "மேசை", "টেবিল", "టేబుల్", "ಟೇಬಲ್", "മേശ", "ટેબલ", "ਮੇਜ਼", "ଟେବୁଲ", "میز"],
  chair: ["कुर्सी", "चेयर", "நாற்காலி", "চেয়ার", "కుర్చీ", "ಕುರ್ಚಿ", "കസേര", "ખુરશી", "ਕੁਰਸੀ", "ଚେୟାର", "کرسی"],
  bedsheet: ["चादर", "बेडशीट", "चादरें", "படுக்கை விரிப்பு", "বিছানা", "బెడ్షీట్", "ಹಾಸಿಗೆ", "ബെഡ്ഷീറ്റ്", "ચાદર", "ਚਾਦਰ", "ଚାଦର", "چادر"],
  cookware: ["बर्तन", "भांडे", "कुकवेयर", "पात्र", "பாத்திரம்", "হাঁড়ি", "వంటపాత్రలు", "ಅಡುಗೆ ಪಾತ್ರೆ", "പാത്രങ്ങൾ", "વાસણ", "ਭਾਂਡੇ", "ପାତ୍ର", "برتن"],
  perfume: ["इत्र", "परफ्यूम", "सुगंध", "खुशबू", "வாசனை", "সুগন্ধি", "పర్ఫ్యూమ్", "ಸುಗಂಧ", "സുഗന്ധം", "પરફ્યુમ", "ਪਰਫਿਊਮ", "ସୁଗନ୍ଧ", "عطر", "خوشبو"],
  lipstick: ["लिपस्टिक", "रंग", "உதட்டுச்சாயம்", "লিপস্টিক", "లిప్స్టిక్", "ಲಿಪ್‌ಸ್ಟಿಕ್", "ലിപ്സ്റ്റിക്", "લિપસ્ટિક", "ਲਿਪਸਟਿਕ", "লিপস্টিক"],
  toy: ["खिलौना", "खिलौने", "टॉय", "பொம்மை", "খেলনা", "బొమ్మ", "ಆಟಿಕೆ", "കളിപ്പാട്ടം", "રમકડું", "ਖਿਡੌਣਾ", "ଖେଳନା", "کھلونا"],
  atta: ["आटा", "गेहूं", "गेहूँ", "चक्की", "மாவு", "গম", "గోధుమ పిండి", "ಗೋಧಿ ಹಿಟ್ಟು", "ഗോതമ്പ്", "લોટ", "ਆਟਾ", "ଆଟା", "آٹا"],
  flour: ["आटा", "मैदा", "பொடி", "ময়দা", "పిండి", "ಹಿಟ್ಟು", "പൊടി", "લોટ", "ਆਟਾ", "ଅଟା", "آٹا"],
  rice: ["चावल", "चावलें", "भात", "அரிசி", "চাল", "బియ్యం", "ಅಕ್ಕಿ", "അരി", "ચોખા", "ਚੌਲ", "ଚାଉଳ", "چاول"],
  basmati: ["बासमती", "चावल", "பாஸ்மதி", "বাসমতি", "బాస్మతి", "ಬಾಸ್ಮತಿ", "ബസ്മതി", "બાસમતી", "ਬਾਸਮਤੀ", "باسمتی"],
  food: ["खाना", "भोजन", "अनाज", "உணவு", "খাবার", "ఆహారం", "ಆಹಾರ", "ഭക്ഷണം", "ખોરાક", "ਭੋਜਨ", "ଖାଦ୍ୟ", "کھانا"],
  grocery_item: ["किराना", "राशन", "मसाला", "மளிகை", "মুদি", "సరుకు", "ದಿನಸಿ", "പലചരക്ക്", "કરિયાણું", "ਕਰਿਆਨਾ", "ମୁଦି"],
  luggage: ["सामान", "ट्रॉली", "बैग", "பயணப் பை", "লাগেজ", "లగేజ్", "ಲಗೇಜ್", "ലഗേജ്", "સામાન", "ਸਮਾਨ", "ଲଗେଜ", "سامان"],
  backpack: ["बैकपैक", "बस्ता", "झोला", "मोचिला", "பின்பை", "ব্যাকপ্যাক", "బ్యాక్ప్యాక్", "ಬ್ಯಾಕ್ಪ್ಯಾಕ್", "ബാക്ക്പാക്ക്", "બેકપેક", "ਬੈਕਪੈਕ", "بستہ"],

  /* --- colours / sizes --- */
  blue: ["नीला", "नीली", "நீலம்", "নীল", "నీలం", "ನೀಲಿ", "നീല", "વાદળી", "ਨੀਲਾ", "ନୀଳ", "نیلا"],
  black: ["काला", "काली", "கருப்பு", "কালো", "నలుపు", "ಕಪ್ಪು", "കറുപ്പ്", "કાળો", "ਕਾਲਾ", "କଳା", "سیاہ"],
  white: ["सफेद", "सफ़ेद", "வெள்ளை", "সাদা", "తెలుపు", "ಬಿಳಿ", "വെളുപ്പ്", "સફેદ", "ਸਫ਼ੈਦ", "ଧଳା", "سفید"],
  green: ["हरा", "हरी", "பச்சை", "সবুজ", "ఆకుపచ్చ", "ಹಸಿರು", "പച്ച", "લીલો", "ਹਰਾ", "ସବୁଜ", "ہرا"],
  red: ["लाल", "சிவப்பு", "লাল", "ఎరుపు", "ಕೆಂಪು", "ചുവപ്പ്", "લાલ", "ਲਾਲ", "ଲାଲ", "سرخ"],
  grey: ["स्लेटी", "धूसर", "स्लेट", "சாம்பல்", "ধূসর", "బూడిద", "ಬೂದು", "ചാരനിറം", "ભૂખરો", "ਸਲੇਟੀ", "سلیٹی"],
  golden: ["सुनहरा", "सोना", "तांबा", "தங்கம்", "সোনালি", "బంగారం", "ಚಿನ್ನ", "സ്വർണം", "સોનેરી", "ਸੁਨਹਿਰੀ", "سنہری"],
  maroon: ["मैरून", "गहरा लाल", "கடுஞ்சிவப்பு", "মেরুন", "మెరూన్", "ಮರೂನ್", "മറൂൺ", "મેરૂન", "ਮੈਰੂਨ"],

  /* --- common shopping words --- */
  buy: ["खरीदना", "खरीद", "கரி", "কেনা", "కొనండి", "ಖರೀದಿ", "വാങ്ങുക", "ખરીદો", "ਖਰੀਦੋ", "କିଣ", "خریدنا"],
  online: ["ऑनलाइन", "இணையம்", "অনলাইন", "ఆన్లైన్", "ಆನ್ಲೈನ್", "ഓൺലൈൻ", "ઓનલાઈન", "ਆਨਲਾਈਨ", "ଅନଲାଇନ", "آن لائن"],
  cheap: ["सस्ता", "सस्ती", "மலிவு", "সস্তা", "చౌక", "ಅಗ್ಗ", "വിലകുറഞ്ഞ", "સસ્તું", "ਸਸਤਾ", "ଶସ୍ତା", "سستا"],
  best: ["सबसे अच्छा", "बेस्ट", "சிறந்த", "সেরা", "ఉత్తమ", "ಅತ್ಯುತ್ತಮ", "മികച്ച", "શ્રેષ્ઠ", "ਵਧੀਆ", "ସର୍ବୋତ୍ତମ", "بہترین"],
  new: ["नया", "नई", "புதிய", "নতুন", "కొత్త", "ಹೊಸ", "പുതിയ", "નવું", "ਨਵਾਂ", "ନୂଆ", "نیا"],
  gift: ["उपहार", "तोहफा", "पारितोषिक", "பரிசு", "উপহার", "బహుమతి", "ಉಡುಗೊರೆ", "സമ്മാനം", "ભેટ", "ਤੋਹਫ਼ਾ", "ଉପହାର", "تحفہ"],
  offer: ["ऑफर", "छूट", "सेल", "தள்ளுபடி", "অফার", "ఆఫర్", "ಆಫರ್", "ഓഫർ", "ઑફર", "ਆਫ਼ਰ", "ଅଫର", "آفر"],
  discount: ["छूट", "डिस्काउंट", "तள்ளுபடி", "డిస్కౌంట్", "ರಿಯಾಯಿತಿ", "കിഴിവ്", "ડિસ્કાઉન્ટ", "ਛੋਟ", "ରିହାତି", "رعایت"],
  price: ["कीमत", "दाम", "मूल्य", "விலை", "দাম", "ధర", "ಬೆಲೆ", "വില", "કિંમત", "ਕੀਮਤ", "ଦାମ", "قیمت"],

  /* --- month word used in the existing copy --- */
  naye: ["नए", "नये"]
};

/* Brand names written in Indian scripts -> English brand.  These let a
   shopper type "आईफोन", "சாம்சங்" or "স্যামসাং" and still find the phone. */
const BRAND_ALIASES = {
  apple: ["आईफोन", "एप्पल", "ஆப்பிள்", "আইফোন", "ఐఫోన్", "ಐಫೋನ್", "ഐഫോൺ", "એપલ", "ਐਪਲ", "ଆଇଫୋନ"],
  samsung: ["सैमसंग", "சாம்சங்", "স্যামসাং", "శామ్సంగ్", "ಸ್ಯಾಮ್ಸಂಗ್", "സാംസങ്", "સેમસંગ", "ਸੈਮਸੰਗ", "ସାମସଙ୍ଗ"],
  oneplus: ["वनप्लस", "ஒன்பிளஸ்", "ওয়ানপ্লাস", "వన్‌ప్లస్", "ಒನ್‌ಪ್ಲಸ್", "വൺപ്ലസ്", "વનપ્લસ", "ਵਨਪਲੱਸ"],
  xiaomi: ["शाओमी", "சியோமி", "শাওমি", "షావోమి", "ಶಿಯೋಮಿ", "ഷാവോമി", "શાઓમી", "ਸ਼ਾਓਮੀ"],
  redmi: ["रेडमी", "ரெட்மி", "রেডমি", "రెడ్మి", "ರೆಡ್ಮಿ", "റെഡ്മി", "રેડમી", "ਰੈੱਡਮੀ"],
  sony: ["सोनी", "சோனி", "সনি", "సోనీ", "ಸೋನಿ", "സോണി", "સોની", "ਸੋਨੀ"],
  nike: ["नाइकी", "நைக்", "নাইক", "నైక్", "ನೈಕ್", "നൈക്ക്", "નાઇક", "ਨਾਈਕੀ"],
  hp: ["एचपी", "एच पी", "எச்பி", "এইচপি", "హెచ్పీ", "ಎಚ್ಪಿ", "എച്ച്പി", "એચપી", "ਐਚਪੀ"],
  lg: ["एलजी", "எல்ஜி", "এলজি", "ఎల్జీ", "ಎಲ್ಜಿ", "എൽജി", "એલજી", "ਐਲਜੀ"],
  philips: ["फिलिप्स", "பிலிப்ஸ்", "ফিলিপস", "ఫిలిప్స్", "ಫಿಲಿಪ್ಸ್", "ഫിലിപ്സ്", "ફિલિપ્સ", "ਫਿਲਿਪਸ"],
  daikin: ["डाइकिन", "டைக்கின்", "ডাইকিন", "డైకిన్", "ಡೈಕಿನ್", "ഡൈകിൻ", "ડાઇકિન", "ਡਾਈਕਿਨ"],
  dyson: ["डायसन", "டைசன்", "ডাইসন", "డైసన్", "ಡೈಸನ್", "ഡൈസൺ", "ડાયસન", "ਡਾਇਸਨ"],
  canon: ["कैनन", "கேனான்", "ক্যানন", "కానన్", "ಕ್ಯಾನನ್", "കാനൺ", "કેનન", "ਕੈਨਨ"],
  prestige: ["प्रेस्टीज", "பிரெஸ்டீஜ்", "প্রেস্টিজ", "ప్రెస్టీజ్", "ಪ್ರೆಸ್ಟೀಜ್", "പ്രെസ്റ്റീജ്", "પ્રેસ્ટીજ", "ਪ੍ਰੈਸਟੀਜ"],
  wipro: ["विप्रो", "விப்ரோ", "উইপ্রো", "విప్రో", "ವಿಪ್ರೊ", "വിപ്രോ", "વિપ્રો", "ਵਿਪਰੋ"],
  aashirvaad: ["आशीर्वाद", "ஆசிர்வாத்", "আশীর্বাদ", "ఆశీర్వాద్", "ಆಶೀರ್ವಾದ್", "ആശീർവാദ്", "આશીર્વાદ", "ਆਸ਼ੀਰਵਾਦ"],
  boat: ["बोट", "போட்", "বোট", "బోట్", "ಬೋಟ್", "ബോട്ട്", "બોટ", "ਬੋਟ"],
  lego: ["लेगो", "லெகோ", "লেগো", "లెగో", "ಲೆಗೊ", "ലെഗോ", "લેગો", "ਲੈਗੋ"]
};

/* ---------- 2. BUILD REVERSE INDEX ---------------------------------- */
/* word (as typed) -> english shopping term                     */
const WORD_TO_EN = (() => {
  const map = new Map();
  const norm = s => s.toLowerCase().normalize("NFC").trim();
  for (const [en, words] of Object.entries(SEARCH_DICT)) {
    map.set(norm(en), en);
    for (const w of words) {
      const k = norm(w);
      if (k) map.set(k, en);
    }
  }
  for (const [brand, words] of Object.entries(BRAND_ALIASES)) {
    map.set(norm(brand), brand);
    for (const w of words) {
      const k = norm(w);
      if (k) map.set(k, brand);
    }
  }
  return map;
})();

/* Split any script into searchable words. \p{L}\p{M}\p{N} keeps
   matras (combining marks) attached to Tamil/Hindi letters.      */
function tokenize(text) {
  return (text || "")
    .toLowerCase()
    .normalize("NFC")
    .split(/[^\p{L}\p{M}\p{N}]+/u)
    .filter(Boolean);
}

/* Translate one typed word to an English shopping term (or null). */
function translateWord(word) {
  const w = (word || "").toLowerCase().normalize("NFC").trim();
  if (!w) return null;
  if (WORD_TO_EN.has(w)) return WORD_TO_EN.get(w);
  /* prefix match: "मोबाइ" -> "मोबाइल" -> mobile */
  for (const [k, en] of WORD_TO_EN) {
    if (k.length >= 3 && (k.startsWith(w) || w.startsWith(k))) return en;
  }
  return null;
}

/* Convert a whole query into extra English search terms. */
function translateQuery(q) {
  const out = [];
  for (const w of tokenize(q)) {
    const en = translateWord(w);
    if (en && !out.includes(en)) out.push(en);
  }
  return out;
}

/* Some dictionary keys name a CATEGORY rather than a keyword
   (e.g. "मोबाइल" -> mobile). Map those to the category id so a
   Hindi word can match "Mobiles" products even though the English
   word "mobile" never appears in the catalog text.              */
const TERM_TO_CATEGORY = {
  mobile: "mobiles", phone: "mobiles", smartphone: "mobiles",
  electronics: "electronics", laptop: "electronics", computer: "electronics",
  earphone: "electronics", headphone: "electronics", earbuds: "electronics",
  speaker: "electronics", watch: "electronics", camera: "electronics", tv: "electronics",
  fashion: "fashion", shirt: "fashion", kurta: "fashion", dress: "fashion",
  shoe: "fashion", shoes: "fashion", sneakers: "fashion", bag: "fashion",
  home: "home", table: "home", chair: "home", bedsheet: "home",
  lamp: "home", light: "home", cookware: "home",
  appliances: "appliances", fridge: "appliances", washing: "appliances",
  machine: "appliances", ac: "appliances", mixer: "appliances",
  grinder: "appliances", fan: "appliances", cooler: "appliances",
  beauty: "beauty", perfume: "beauty", lipstick: "beauty", toy: "beauty",
  grocery: "grocery", atta: "grocery", flour: "grocery", rice: "grocery",
  basmati: "grocery", food: "grocery", grocery_item: "grocery",
  travel: "travel", luggage: "travel", backpack: "travel"
};

/* Translate the query into the categories it points at. */
function queryCategories(q) {
  const out = [];
  for (const en of translateQuery(q)) {
    const cid = TERM_TO_CATEGORY[en];
    if (cid && !out.includes(cid)) out.push(cid);
  }
  return out;
}

/* ---------- 3. MULTI-LANGUAGE MATCHING ------------------------------ */
function productHaystack(p) {
  return [
    p.title, p.brand, p.category, p.desc,
    ...(p.highlights || []),
    ...(p.tags || [])
  ].join(" ").toLowerCase();
}

/* Words that describe a product but may not be in the catalog text.
   If one of these is the ONLY thing typed, we don't want an empty
   result, so they act as soft filters.                            */
const SOFT_TERMS = new Set([
  "blue", "black", "white", "green", "red", "grey", "golden", "maroon",
  "buy", "online", "cheap", "best", "new", "gift", "offer", "discount",
  "price", "naye"
]);

/* Does product `p` match query `q` (any Indian language)? */
function searchMatches(p, q, categories) {
  const query = (q || "").trim();
  if (!query) return true;

  const tokens = tokenize(query);
  const cats = categories || (typeof CATEGORIES !== "undefined" ? CATEGORIES : []);

  /* whole query is a category id or name */
  const lower = query.toLowerCase();
  const cat = cats.find(c => c.id.toLowerCase() === lower || c.name.toLowerCase() === lower);
  if (cat) return p.category === cat.id;

  const translations = translateQuery(query);
  const catIds = queryCategories(query);

  /* If a Hindi/regional word names a category (मोबाइल -> mobiles),
     treat it as a category filter.                                  */
  if (catIds.length && tokens.every(w => {
    const en = translateWord(w);
    return !en || TERM_TO_CATEGORY[en] || SOFT_TERMS.has(en);
  })) {
    if (catIds.includes(p.category)) return true;
  }

  /* words to look for = typed words + their English meanings.
     When a regional word has a translation we drop the original,
     because the catalog text is in English.                     */
  const terms = [];
  for (const w of tokens) {
    const en = translateWord(w);
    if (!en) { terms.push(w); continue; }          /* unknown word: try as-is */
    if (SOFT_TERMS.has(en)) continue;              /* colour/adjective: ignore */
    terms.push(en);
  }
  for (const en of translations) {
    if (SOFT_TERMS.has(en)) continue;
    if (!terms.includes(en)) terms.push(en);
  }
  const finalTerms = [...new Set(terms)];
  if (!finalTerms.length) return true;             /* only soft words -> show all */
  const hay = productHaystack(p);
  return finalTerms.every(w => hayHas(hay, w));
}

/* Match a term in the product text. English terms use word
   boundaries so "phone" does not match "headphones".      */
function hayHas(hay, w) {
  if (/^[a-z0-9]+$/i.test(w)) {
    const re = new RegExp("\\b" + w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b", "i");
    return re.test(hay);
  }
  return hay.includes(w);
}

/* ---------- 4. LIVE SUGGESTIONS ------------------------------------- */
/* Returns a small, ranked list of suggestions for the dropdown.      */
function searchSuggest(q, products, categories, limit) {
  limit = limit || 8;
  const query = (q || "").trim();
  if (!query) return [];

  const cats = categories || (typeof CATEGORIES !== "undefined" ? CATEGORIES : []);
  const list = products || (typeof PRODUCTS !== "undefined" ? PRODUCTS : []);
  const lower = query.toLowerCase().normalize("NFC");
  const out = [];
  const seen = new Set();
  const push = item => {
    const key = item.type + "|" + item.label;
    if (!seen.has(key) && out.length < limit) { seen.add(key); out.push(item); }
  };

  /* 1. category suggestions - direct prefix, or via translation */
  let catHit = cats.find(c =>
    c.id.toLowerCase().startsWith(lower) || c.name.toLowerCase().startsWith(lower));
  if (!catHit) {
    const catIds = queryCategories(query);
    catHit = cats.find(c => catIds.includes(c.id));
  }
  if (!catHit) {
    /* e.g. "मोबाइ" -> mobile -> mobiles (prefix on translated term) */
    for (const en of translateQuery(query)) {
      const c = cats.find(x => x.id.startsWith(en) || en.startsWith(x.id));
      if (c) { catHit = c; break; }
    }
  }
  if (catHit) push({ type: "category", label: catHit.name, sub: "Browse category", cat: catHit.id, emoji: catHit.emoji });

  /* 2. brand suggestions */
  const brands = [...new Set(list.map(p => p.brand))];
  const brandHits = brands.filter(b => b.toLowerCase().startsWith(lower)).slice(0, 2);
  for (const b of brandHits) push({ type: "brand", label: b, sub: "Brand", emoji: "🏷️" });

  /* 3. product suggestions (multi-language aware) */
  const hits = list.filter(p => searchMatches(p, query, cats)).slice(0, limit);
  for (const p of hits) {
    push({
      type: "product",
      label: p.title,
      sub: p.brand + " · " + catName(p.category, cats),
      id: p.id,
      img: p.img,
      emoji: catEmoji(p.category, cats)
    });
  }

  /* 4. fallback "search for ..." row, only when nothing matched */
  if (!hits.length) push({ type: "query", label: query, sub: "Search for this", emoji: "🔍" });
  return out;
}

/* Products matching a query, for the results page. */
function searchList(q, products, categories) {
  const list = products || (typeof PRODUCTS !== "undefined" ? PRODUCTS : []);
  const cats = categories || (typeof CATEGORIES !== "undefined" ? CATEGORIES : []);
  return list.filter(p => searchMatches(p, q, cats));
}

function catName(id, cats) {
  const c = (cats || CATEGORIES).find(x => x.id === id);
  return c ? c.name : id;
}
function catEmoji(id, cats) {
  const c = (cats || CATEGORIES).find(x => x.id === id);
  return c ? c.emoji : "📦";
}

/* ---------- 5. EXPORT (browser global) ------------------------------ */
if (typeof window !== "undefined") {
  window.SmartSearch = {
    SEARCH_DICT, WORD_TO_EN,
    tokenize, translateWord, translateQuery,
    searchMatches, searchList, searchSuggest,
    catName, catEmoji
  };
}
