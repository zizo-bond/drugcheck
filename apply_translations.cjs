const fs = require('fs');

const databasePath = 'c:/Users/CW/Desktop/drugcheck/data/database.ts';

// Dictionary of translations and enhancements
// Key: Arabic phrase found in the database
// Value: Enhanced English translation
const dictionary = {
    // Mechanisms
    "تأثير تآزري على القلب": "Synergistic Cardiodepressant Effect. Both drugs exert negative inotropic and/or chronotropic effects on the myocardium.",
    "تثبيط XO.": "Xanthine Oxidase Inhibition. Allopurinol inhibits the metabolism of azathioprine/6-MP, leading to accumulation.",
    "آلية غير معروفة تماماً.": "Unknown Mechanism. The exact pathophysiological basis of this interaction is not fully elucidated.",
    "تزداد تراكيز البنزوديازيبين": "Increased Benzodiazepine Concentrations. Inhibition of hepatic CYP450 enzymes reduces benzodiazepine clearance.",
    "تضاد في التأثير": "Pharmacodynamic Antagonism. The drugs exert opposing physiological effects, potentially nullifying therapeutic benefits.",
    "تحفيز الجهاز العصبي.": "CNS Stimulation. Additive excitatory effects on the central nervous system may lower seizure threshold.",
    "تزداد تراكيز الأمينوغليكوزيدات": "Increased Aminoglycoside Concentrations. Reduced renal clearance or competitive elimination leads to accumulation.",
    "تزداد تراكيز TCA - تزداد خطورة متلازمة السيروتونين": "Increased TCA Concentrations & Serotonin Syndrome Risk. Inhibition of TCA metabolism and additive serotonergic activity.",
    "حجب أعراض الهبوط.": "Masking of Hypoglycemia. Beta-blockers can mask adrenergic warning signs of hypoglycemia (e.g., tremors, palpitations).",
    "تحفيز إنزيمات الكبد (CYP450)، خفض فاعلية حاصرات بيتا": "CYP450 Induction. Hepatic enzyme induction accelerates beta-blocker metabolism, reducing its plasma concentration and efficacy.",
    "تقليل الامتصاص": "Reduced Absorption. Physicochemical interaction or altered GI motility decreases drug bioavailability.",
    "تزداد السمية الكلوية": "Additive Nephrotoxicity. Concurrent use of nephrotoxic agents compromises renal function synergistically.",
    "تفاعل دوائي": "Drug Interaction. A generic pharmacological interaction altering pharmacokinetics or pharmacodynamics.",
    "تحفيز إنزيمات الكبد (CYP450)، خفض فاعلية الكورتيكوستيرويدات": "CYP450 Induction. Accelerated metabolism of corticosteroids leads to subtherapeutic levels.",
    "تزداد تراكيز السيكلوسبورين": "Increased Cyclosporine Levels. Inhibition of CYP3A4 or P-glycoprotein reduces cyclosporine elimination.",
    "يزداد تركيز البنزوديازيبينات": "Increased Benzodiazepine Levels. Reduced metabolic clearance leads to prolonged sedation and respiratory depression risk.",
    "تضاد في التأثير الخافض لضغط الدم": "Antagonism of Antihypertensive Effect. One agent causes fluid retention or vasoconstriction, countering the other's blood pressure lowering effect.",
    "تراكم البوتاسيوم.": "Potassium Accumulation. Additive potassium-sparing effects impair renal potassium excretion.",
    "مخلبية.": "Chelation Complex Formation. Formation of insoluble complexes in the GI tract prevents absorption.",
    "تزداد خطورة اضطراب نظم القلب بما فيها انقلاب لُزْرى (Torsades de Pointes).": "QT Prolongation & Torsades de Pointes. Additive effect on cardiac repolarization increases risk of fatal arrhythmias.",
    "تزداد تراكيز الليثيوم": "Increased Lithium Levels. Reduced renal excretion of lithium leads to toxicity.",
    "البرازوسين (حاصر ألفا1) وحاصرات بيتا يعملان على خفض ضغط الدم عبر آليات مختلفة، مما يؤدي إلى تأثير تآزري في خفض ضغط الدم وخاصة عند تغيير الوضعية": "Synergistic Hypotension. Combined Alpha-1 and Beta blockade causes profound vasodilation and blunted reflex tachycardia, especially orthostatic.",
    "تزداد خطورة السمية السمعية": "Additive Ototoxicity. Synergistic damage to cochlear or vestibular hair cells.",
    "تزداد فعالية الأثر الرافع للضغط": "Potentiated Pressor Effect. Inhibition of catecholamine metabolism or reuptake enhances vasopressor response.",
    "تتناقص فعالية البنسيلينات.": "Reduced Penicillin Efficacy. Bacteriostatic agents may interfere with the bactericidal action of penicillins.",
    "تزداد خطورة سمية الإرغوت": "Ergot Toxicity Risk. Inhibition of ergot metabolism leads to severe vasoconstriction and ischemia (Ergotism).",
    "قتل البكتيريا المعوية النافعة التي تساعد في إعادة امتصاص الاستروجين (Enterohepatic circulation).": "Disruption of Enterohepatic Circulation. Antibiotics reduce gut flora required for estrogen hydrolysis and reabsorption.",
    "تحفيز إنزيمات الكبد (CYP450)، خفض فاعلية الدواء": "CYP450 Induction. Accelerated metabolism reduces the therapeutic efficacy of the object drug.",
    "تثبيط متبادل لآليات تنظيم ضغط الدم عبر مستقبلات ألفا2 وبيتا الأدرينالية": "Antagonistic Blood Pressure Regulation. Opposing effects on adrenergic receptors destabilize blood pressure control.",
    "تكوين معقدات": "Complexation. Formation of non-absorbable complexes in the gastrointestinal tract.",
    "تأثير إضافي خافض لضغط الدم (Additive Hypotensive Effect)": "Additive Hypotensive Effect. Combined mechanisms of action lead to excessive blood pressure reduction.",
    "مخلبية (Chelation).": "Chelation. Divalent/trivalent cations bind to the drug, preventing systemic absorption.",
    "يتناقص الامتصاص المعدي المعوي للتتراسيكلين": "Reduced Tetracycline Absorption. Binding with cations or altered pH impairs tetracycline bioavailability.",
    "تأثيرات مضاعفة على الجهاز العصبي المركزي": "Additive CNS Depression. Combined central nervous system depressant effects increase risk of sedation and respiratory compromise.",
    "تكوين معقدات غير قابلة للامتصاص": "Non-absorbable Complex Formation. Chemical binding in the gut lumen prevents drug absorption.",
    "تقليل الإطراح.": "Reduced Excretion. Competition for renal tubular secretion or altered urinary pH decreases drug elimination.",
    "مضادات الاكتئاب ثلاثية الحلقات تمنع عمل الكلونيدين على مستقبلات ألفا2 الأدرينالية": "Alpha-2 Receptor Antagonism. TCAs block the central alpha-2 adrenergic uptake of clonidine, negating its antihypertensive effect.",
    "تضاد في التأثير على الجهاز العصبي الودي ومستقبلات الأدرينالية": "Sympathetic Antagonism. Opposing actions on the sympathetic nervous system.",
    "تخريش.": "Irritation. Direct mucosal injury or chemical irritation.",
    "احتباس سوائل.": "Fluid Retention. Sodium and water retention exacerbates volume overload.",
    "تثبيط البروستاجلاندين الذي يحمي جدار المعدة.": "Prostaglandin Inhibition. COX inhibition depletes cytoprotective gastric prostaglandins, increasing ulcer risk.",
    "تأثير تآزري في تثبيط COX، مما يزيد من الآثار الجانبية": "Synergistic COX Inhibition. Dual inhibition of Cyclooxygenase enzymes amplifies gastrointestinal and renal toxicity.",
    "إخفاء أعراض انخفاض السكر": "Masking Hypoglycemia. Adrenergic warning signs of hypoglycemia are blunted.",
    "تثبيط الأيض.": "Metabolic Inhibition. Competitive or non-competitive inhibition of metabolic enzymes (e.g., CYP450).",
    "تأثير على البروستاجلاندين الكلوي.": "Renal Prostaglandin Inhibition. Reduced renal blood flow due to afferent arteriole constriction.",
    "نقص تروية الكلى.": "Renal Ischemia. Reduced renal perfusion pressure or vasoconstriction.",
    "تزداد تراكيز مثبطات البروتياز": "Increased Protease Inhibitor Levels. CYP450 inhibition reduces clearance.",
    "السيميتيدين يثبط إنزيمات الكبد CYP450": "Cimetidine CYP Inhibition. Cimetidine is a broad-spectrum inhibitor of CYP450 enzymes, increasing levels of co-administered drugs.",
    "تفاعل دوائي يؤدي إلى زيادة تركيز كلا الدوائين": "Bidirectional Interaction. Mutual metabolic inhibition increases plasma concentrations of both agents.",
    "تثبيط متبادل لآليات تنظيم ضغط الدم": "Counteractive BP Regulation. Mechanisms of action oppose each other, leading to poor BP control.",
    "تأثير تآزري في خفض ضغط الدم": "Synergistic Hypotension. Combined effects lead to significant blood pressure drop.",
    "تثبيط القلب.": "Cardiac Depression. Negative inotropic and chronotropic effects.",
    "حجب أعراض هبوط السكر (مثل الرجفة والخفقان).": "Masking Hypoglycemia Symptoms. Tremors and palpitations associated with hypoglycemia are blocked.",
    "حصر مستقبالت بيتا-2 في الرئة يسبب تضيق القصبات.": "Beta-2 Blockade. Non-selective beta-blockade causes bronchoconstriction in susceptible patients.",
    "تضيق قصبي.": "Bronchoconstriction. Narrowing of the airways.",
    "عند السحب المفاجئ.": "Withdrawal Rebound. Abrupt cessation precipitates rebound hypertension or ischemia.",
    "تضاد في التأثير على مستقبلات بيتا": "Beta-Receptor Antagonism. Competitive binding at beta-adrenergic receptors.",
    "تضاد في التأثير القلبي الوعائي": "Cardiovascular Antagonism. Opposing hemodynamic effects.",
    "تضاد في التأثير الودي": "Sympathetic Antagonism. Interference with sympathetic tone.",
    "تفاعل في التأثير على ضغط الدم": "Blood Pressure Interaction. Altered hemodynamic response.",
    "تضاد كامل في التأثير": "Complete Antagonism. The drugs completely negate each other's effects.",
    "تضاد في التأثير الوعائي": "Vascular Antagonism. Opposing effects on vascular tone (constriction vs dilation).",
    "تضاد في التأثير القلبي": "Cardiac Antagonism. Opposing effects on cardiac function.",
    "تثبيط الصفائح + تخريش المعدة.": "Antiplatelet Effect & Gastric Irritation. Combined bleeding risk and mucosal injury.",
    "الباربيتورات تزيد من التوافر الحيوي لحاصرات بيتا": "Increased Beta-Blocker Bioavailability. Barbiturates may alter first-pass metabolism (Note: usually they induce metabolism, verify context).",
    "أملاح الكالسيوم تعاكس التأثير الدوائي للفيراباميل من خلال منافسة قنوات الكالسيوم": "Calcium Channel Antagonism. Exogenous calcium competes for calcium channels, potentially reversing the therapeutic effect of Verapamil.",
    "تزداد تراكيز البنزوديازيبين - قد يحدث تثبيط نفسي أو تركين": "Increased Benzodiazepine Effect. Elevated levels lead to excessive sedation and psychomotor impairment.",
    "زيادة تركيز الأسبرين": "Increased Aspirin Levels. Reduced clearance or displacement leads to toxicity.",
    "تزيد الكورتيكوستيرويدات تصفية الساليسيلات، مما يؤدي إلى تناقص فعالية الأسبرين - عند إيقافها، تزداد تراكيز الساليسيلات وخطر السمية": "Salicylate Clearance Alteration. Corticosteroids induce salicylate clearance; withdrawal precipitates salicylate toxicity.",
    "تأثير تآزري في زيادة سيولة الدم (الأسبرين يثبط الصفيحات، الأخرى تقلل التخثر)": "Synergistic Anticoagulation. Combined antiplatelet and anticoagulant effects significantly increase bleeding risk.",
    "مقاومة الأنسولين.": "Insulin Resistance. Drug-induced impairment of insulin sensitivity.",
    "الكورتيزون يرفع السكر ويحبس السوائل (يرفع الضغط).": "Hyperglycemia & Fluid Retention. Corticosteroids induce gluconeogenesis and mineralocorticoid activity.",
    "تزداد فعالية البوسبيرون": "Increased Buspirone Efficacy. Elevated levels enhance anxiolytic or sedative effects.",
    "إطالة QT.": "QT Prolongation. Delayed cardiac repolarization.",
    "تحفيز الأيض.": "Metabolic Induction. Induction of hepatic enzymes accelerates drug clearance.",
    "تتناقص فعالية الميثادون - قد تحصل أعراض السحب لدى المرضى المزمنين المعالجين بميثادون": "Reduced Methadone Efficacy. Enzyme induction lowers methadone levels, risking opioid withdrawal.",
    "زيادة تكسير الكورتيزون.": "Increased Corticosteroid Catabolism. Accelerated metabolism reduces steroid efficacy.",
    "تتناقص فعالية الفينوثيازين - زيادة الآثار الجانبية الكولنرجيّة (مثل جفاف الفم والإمساك)": "Reduced Phenothiazine Efficacy & Anticholinergic Load. Metabolic interaction lowers efficacy while additive anticholinergic effects worsen side effects.",
    "كلا الدوائين يطيلان فترة QT في تخطيط القلب الكهربائي، مما يزيد من خطر عدم انتظام ضربات القلب": "Additive QT Prolongation. Concurrent use significantly increases the risk of Torsades de Pointes.",
    "تزداد تراكيز السيكلوسبورين (تثبيط إنزيمي)": "Increased Cyclosporine (Enzyme Inhibition). CYP3A4 inhibition leads to toxic cyclosporine levels.",
    "تتناقص فعالية مثبطات قبط السيروتونين المضادة للاكتئاب": "Reduced SSRI Efficacy. Pharmacodynamic or pharmacokinetic interaction diminishes antidepressant response.",
    "تزداد تراكيز الكلوزابين (عن طريق تثبيط إنزيمات الاستقلاب، خاصة CYP1A2)": "Increased Clozapine Levels. CYP1A2 inhibition elevates clozapine, increasing seizure and agranulocytosis risk.",
    "تتناقص تراكيز السيكلوسبورين": "Reduced Cyclosporine Levels. Enzyme induction lowers levels, risking transplant rejection.",
    "تزداد خطورة السمية العصبية": "Increased Neurotoxicity Risk. Additive toxic effects on the nervous system.",
    "يتناقص تركيز الدوكسي سيكلين": "Reduced Doxycycline Levels. Enhanced metabolism shortens half-life.",
    "تزداد خطورة اضطراب نظم القلب بما فيه انقلاب لُزْرى.": "Arrhythmia Risk (Torsades de Pointes). Significant risk of fatal ventricular arrhythmias.",
    "ردود فعل مشابهة لتلك التي تحدث مع المعالجة بالديسولفيرام (مثل الاحمرار، الغثيان، القيء)": "Disulfiram-like Reaction. Accumulation of acetaldehyde causes flushing, nausea, and vomiting.",
    "تزيد إماهة المعدة": "Increased Gastric pH/Hydration. Altered gastric environment affects drug dissolution.",
    "تثبيط MAO.": "MAO Inhibition. Inhibition of Monoamine Oxidase prevents breakdown of amines, risking hypertensive crisis.",
    "نقص الألدوستيرون.": "Hypoaldosteronism. Reduced aldosterone leads to hyperkalemia and sodium loss.",
    "زيادة هائلة في مستويات السيروتونين، مما يؤدي إلى خطر متلازمة السيروتونين التي قد تهدد الحياة": "Severe Serotonin Syndrome. Excessive serotonergic activity causes autonomic instability and neuromuscular hyperactivity.",
    "زيادة السيروتونين.": "Increased Serotonin. Elevated synaptic serotonin levels.",
    "تثبيط الإفراز النبيبي الكلوي": "Inhibition of Renal Tubular Secretion. Competition for transport proteins decreases renal elimination.",
    "كلاهما يرفع مستوى البوتاسيوم في الدم.": "Additive Hyperkalemia. Concurrent use of potassium-elevating agents.",
    "تزداد تراكيز التاكروليموس": "Increased Tacrolimus Levels. Metabolic inhibition leads to toxicity.",
    "تقليل النواقل العصبية": "Neurotransmitter Depletion. Reduced synaptic availability of neurotransmitters.",
    "سمية كلوية وسمعية.": "Nephrotoxicity & Ototoxicity. Synergistic damage to kidney and inner ear.",
    "عامل رابط - امتزاز": "Adsorption/Binding. Physical binding prevents absorption.",
    "تضاد مفعول.": "Antagonism. Neutralization of effect.",
    "تحريض إنزيم CYP1A2 بواسطة الهيدروكربونات العطرية.": "CYP1A2 Induction. Polycyclic aromatic hydrocarbons (e.g., from smoking) induce CYP1A2.",
    "خطر متلازمة السيروتونين/ السمية الحادة، وقد تؤدي للوفاة": "Severe Serotonin Toxicity. Life-threatening serotonin syndrome risk.",
    "تزداد تراكيز TCA (تثبيط إنزيمي)": "Increased TCA Levels. Metabolic inhibition risks cardiotoxicity and seizures.",
    "تتناقص تراكيز TCA (تحفيز إنزيمي)": "Reduced TCA Levels. Metabolic induction leads to treatment failure.",
    "خفض التأثير الخافض لضغط الدم للكلونيدين": "Reduced Clonidine Efficacy. Antagonism or physiological opposition reduces BP control.",
    "يتناقص الامتصاص المعدي المعوي للبنسيلينات الفموية.": "Reduced Penicillin Absorption. GI interaction lowers bioavailability.",
    "زيادة تركيز المثبطات بسبب إزاحتها أو تداخل كلوي، مما يزيد من الخطورة السمية (كلوية/عصبية/حماض أيضي)": "Increased Toxicity via Displacement/Renal Interaction. Higher free drug levels cause systemic toxicity.",
    "تثبيط النقل.": "Transport Inhibition. Blockade of drug transporters (e.g., P-gp).",
    "عامل رابط": "Binding Agent. Forms complexes with the drug.",
    "تثبيط CYP3A4.": "CYP3A4 Inhibition. Blockade of the major metabolic enzyme.",
    "سمية كلوية إضافية.": "Additive Nephrotoxicity. Cumulative renal insult.",
    "تثبيط نقل الستاتين.": "Statin Transport Inhibition. Blockade of OATP1B1 increases systemic statin exposure.",
    "تتناقص فعالية الفيلوديبين (يُرجح زيادة استقلابه الكبدي)": "Reduced Felodipine Efficacy. Enhanced metabolism lowers plasma levels.",
    "يزداد تركيز البوسبيرون": "Increased Buspirone Levels. Reduced clearance enhances effects.",
    "يزداد تركيز السيكلوسبورين": "Increased Cyclosporine Levels. Risk of nephrotoxicity.",
    "يتأثر تركيز الكورتيكيد (يزداد/يتناقص حسب الأزول)": "Altered Corticosteroid Levels. Azoles may inhibit or induce metabolism depending on the specific agent.",
    "يتناقص الامتصاص المعدي المعوي لمضادات الفطور الأزولية": "Reduced Azole Absorption. pH-dependent absorption is impaired.",
    "تزداد تراكيز الهالوبيريدول": "Increased Haloperidol Levels. Risk of EPS and QT prolongation.",
    "تزداد تراكيز مثبطات الأنزيم البروتيازي": "Increased Protease Inhibitor Levels. Metabolic inhibition.",
    "تزداد تراكيز البنزوديازيبينات": "Increased Benzodiazepine Levels. Prolonged sedation.",
    "يتناقص الامتصاص المعدي المعوي لليفوتيروكسين": "Reduced Levothyroxine Absorption. Binding or pH changes reduce bioavailability.",
    "تزداد تراكيز البنزوديازيبين - Increased Benzodiazepine concentrations": "Increased Benzodiazepine Concentrations. Reduced clearance.",
    "زيادة تراكيز المونوامينات، مما يزيد خطر أزمة فرط ضغط الدم ومتلازمة السيروتونين والنوبات الصرعية": "Monoamine Accumulation. Risk of hypertensive crisis and serotonin syndrome.",
    "تزداد تراكيز الكينيدين": "Increased Quinidine Levels. Risk of arrhythmias.",
    "تزداد خطورة متلازمة السيروتونين (تهيج بالجملة العصبية، تبدل بالمزاج، رمع عضلي، تخليط ذهني، رعاش)": "Serotonin Syndrome Risk. Symptoms include agitation, clonus, hyperthermia, and tremor.",
    "تزداد تراكيز السيروليميس وأعراض وعلامات السمية": "Sirolimus Toxicity. Elevated levels cause immunosuppression-related toxicity.",
    "حصار عصبي عضلي.": "Neuromuscular Blockade. Potentiation of muscle relaxation.",
    "تزداد تراكيز التاكروليموس وأعراض وعلامات السمية": "Tacrolimus Toxicity. Nephrotoxicity and neurotoxicity risk.",
    "تتناقص تراكيز الفوري كونازول": "Reduced Voriconazole Levels. Risk of fungal treatment failure.",
    "تحفيز إنزيمات الكبد.": "Hepatic Enzyme Induction. Accelerated drug metabolism.",
    "تأثير متراكم على تثبيط الجهاز العصبي المركزي": "Additive CNS Depression. Synergistic sedation.",
    "تأثير مضاد للكولين متراكم": "Additive Anticholinergic Burden. Dry mouth, retention, confusion.",
    "تضافر السمية الكلوية": "Synergistic Nephrotoxicity. Combined renal injury.",
    "الفيراباميل يزيد من تأثير مرخيات العضلات غير المحتلة من خلال آليات متعددة": "Potentiation of Muscle Relaxants. Verapamil prolongs neuromuscular blockade.",
    "تزداد فعالية البنزوديازيبين - قد يحدث تركين وتثبيط نفسي": "Enhanced Benzodiazepine Effect. Risk of profound sedation.",
    "غير معروفة": "Unknown. Mechanism not established.",
    "عوامل محلية": "Local Factors. Localized interaction.",
    "كينولونات": "Quinolones Interaction. Class effect.",
    "تغيير في بكتيريا الأمعاء": "Gut Flora Alteration. Disruption of microbiome.",
    "رفع ضغط العين.": "Increased Intraocular Pressure. Risk of glaucoma exacerbation.",
    "تبطئ الحركة المعدية المعوية": "Slowed GI Motility. Delayed gastric emptying.",
    "تنقص الإفراغ المعدي": "Delayed Gastric Emptying. Slows absorption rate.",
    "توسيع حدقة العين مما يعيق تصريف السوائل.": "Mydriasis. Pupil dilation precipitates angle-closure glaucoma.",
    "تثبيط مُضاف للجهاز العصبي المركزي (CNS)": "Additive CNS Depression. Combined sedative effects.",
    "زيادة تراكيز كل من الفينوثيازين والبروبرانولول (تثبيط متبادل للاستقلاب) - زيادة خطر انخفاض ضغط الدم وبطء ضربات القلب": "Mutual Metabolic Inhibition. Elevated levels of both drugs increase hypotensive and bradycardic risks.",
    "تتناقص فعالية الفينوثيازين (آلية غير محددة أو قد يكون التداخل مع الاستقلاب)": "Reduced Phenothiazine Efficacy. Potential metabolic induction.",
    "تزيد إفراغ المعدة": "Increased Gastric Emptying. Faster absorption onset.",
    "تثبيط قوي لعملية طرح الكولشيسين (P-gp inhibitor).": "P-gp Inhibition (Colchicine). Blockade of efflux leads to fatal colchicine toxicity.",
    "نقص البوتاسيوم والمغنيسيوم.": "Hypokalemia & Hypomagnesemia. Electrolyte depletion increases arrhythmia risk.",
    "قتل البكتيريا التي تكسر الديجوكسين + تثبيط P-gp.": "Digoxin Accumulation. Gut flora killing and P-gp inhibition increase bioavailability.",
    "تقليل التوافر الحيوي": "Reduced Bioavailability. Lower systemic exposure.",
    "ارتباط بالكالسيوم.": "Calcium Binding. Formation of insoluble complexes.",
    "يزداد ضغط الدم الانبساطي - وقد يحدث تنافر فارماكولوجي ما بين نيتروغليسيرين وداي هيدروجوتامين وبالتالي يقلل تأثير نيتروغليسيرين المضاد للذبحة الصدرية": "Antagonism & Hypertension. Dihydroergotamine opposes nitroglycerin's vasodilatory effect.",
    "تتناقص تراكيز الأستروجينات (بسبب تحريض إنزيمات الكبد المسؤولة عن استقلابها)": "Reduced Estrogen Levels. Enzyme induction risks contraceptive failure.",
    "قطع الدورة المعوية الكبدية.": "Interruption of Enterohepatic Recirculation. Reduced drug reabsorption.",
    "تحفيز إنزيمات الكبد التي تكسر الهرمونات": "Hormone Metabolism Induction. Accelerated breakdown of hormonal contraceptives.",
    "تحفيز إنزيمات الكبد مما يزيد من تكسير الهرمونات الموجودة في حبوب منع الحمل.": "Contraceptive Failure Risk. Accelerated metabolism of OCPs.",
    "إزاحة عن البروتين.": "Protein Displacement. Increased free drug fraction.",
    "تتناقص تراكيز الهالوبيريدول - تزداد أعراض الفصام، قد يحدث خلل بالحركة": "Reduced Haloperidol Efficacy. Risk of psychotic relapse.",
    "نقص الصوديوم يزيد عود امتصاص الليثيوم.": "Hyponatremia-Induced Lithium Retention. Low sodium triggers proximal tubular reabsorption of lithium.",
    "تغير الشوارد.": "Electrolyte Disturbance. Imbalance in Na/K/Mg.",
    "تأثير تآزري أو معزز لرفع ضغط الدم": "Synergistic Hypertension. Additive pressor effects.",
    "قد تفشل معالجة الميترونيدازول": "Metronidazole Failure. Reduced efficacy.",
    "تثبيط عملية استقلاب الليدوكائين أو تأثير إضافي على القلب، مما يرفع التراكيز.": "Lidocaine Toxicity. Metabolic inhibition and additive cardiac depression.",
    "تحفيز إنزيمات الكبد (CYP450)، خفض فاعلية الدوكسي سيكلين": "Doxycycline Failure. Enzyme induction reduces half-life.",
    "تحفيز إنزيمات الكبد (CYP450)، خفض فاعلية الإستروجينات": "Estrogen Failure. Enzyme induction reduces efficacy.",
    "تأثير مُضاف ومُثبِّط على الجهاز العصبي المركزي": "Additive CNS Inhibition. Profound sedation.",
    "يقلل الغريزوفولفين من امتصاص الباربيتورات": "Reduced Barbiturate Absorption. Decreased efficacy.",
    "تحفيز إنزيمات الكبد (CYP450)، خفض فاعلية الميثادون": "Methadone Withdrawal. Enzyme induction lowers levels.",
    "تحفيز إنزيمات الكبد (CYP450)، خفض فاعلية الوارفارين (زيادة خطر التجلط)": "Reduced Warfarin Effect. Enzyme induction increases clotting risk.",
    "تثبيط إنزيمات الكبد (CYP450)، زيادة تركيز الباربيتورات": "Barbiturate Toxicity. Metabolic inhibition.",
    "تحفيز تكسير الهرمونات.": "Hormone Catabolism. Reduced hormonal effect.",
    "يزداد تأثير أحدهما أو كليهما": "Potentiated Effect. Increased pharmacologic response.",
    "تضاد في التأثير على الأوعية الدموية": "Vascular Antagonism. Opposing vasoactive effects.",
    "يزداد تركيز أحدهما أو كلاهما": "Increased Concentrations. Metabolic interaction elevates levels.",
    "تتناقص تراكيز الكينيدين.": "Reduced Quinidine Levels. Loss of arrhythmia control.",
    "تزداد خطورة متلازمة السيروتونين": "Serotonin Syndrome Risk. Potentially fatal.",
    "توسع وعائي شديد.": "Severe Vasodilation. Risk of shock.",
    "إطالة فترة QT": "QT Prolongation. Arrhythmia risk.",
    "قد يحدث تأثر عكس لفعالية الفيراباميل. وتزداد سمية الفيراباميل.": "Altered Verapamil Effect. Potential toxicity.",
    "تثبيط إنزيمات الكبد (CYP) المسؤولة عن تكسير الوارفارين.": "Warfarin Potentiation. CYP inhibition increases bleeding risk.",
    "تثبيط استقلاب التولبوتاميد": "Tolbutamide Potentiation. Hypoglycemia risk.",
    "زيادة سمية الكبد": "Hepatotoxicity. Liver damage.",
    "الألياف تقلل الامتصاص": "Fiber-Induced Malabsorption. Dietary fiber binds drug.",
    "سمية كبدية مباشرة أو انخفاض الاستقلاب - تفاقم القصور الكبدي": "Hepatotoxicity & Metabolic Impairment. Worsening liver function.",

    // Effects
    "انخفاض ضغط الدم وبطء القلب": "Hypotension & Bradycardia. Risk of hemodynamic collapse.",
    "سمية نخاع العظم.": "Bone Marrow Suppression. Leukopenia, thrombocytopenia, and anemia.",
    "زيادة احتمالية حدوث طفح جلدي (Skin Rash).": "Increased Risk of Skin Rash. Hypersensitivity reaction.",
    "تزداد تراكيز البنزوديازيبين": "Sedation & Respiratory Depression. Due to elevated benzodiazepine levels.",
    "فشل كلوي، ارتفاع بوتاسيوم الدم": "Renal Failure & Hyperkalemia. Life-threatening electrolyte imbalance.",
    "خطر التشنجات.": "Seizure Risk. Lowered seizure threshold.",
    "زيادة خطر السمية الكلوية.": "Nephrotoxicity Risk. Potential for acute kidney injury.",
    "زيادة التأثيرات المهدئة والجانبية للبنزوديازيبينات": "Enhanced Sedation. Excessive CNS depression.",
    "نقص الامتصاص.": "Decreased Absorption. Subtherapeutic drug levels.",
    "زيادة سمية TCA وخطر متلازمة السيروتونين": "TCA Toxicity & Serotonin Syndrome. Arrhythmias and neuromuscular excitability.",
    "توقف القلب.": "Cardiac Arrest. Asystole or fatal arrhythmia.",
    "زيادة سمية السيكلوسبورين": "Cyclosporine Toxicity. Renal dysfunction and hypertension.",
    "هبوط سكر صامت.": "Masked Hypoglycemia. Unaware hypoglycemia.",
    "انخفاض فعالية حاصرات بيتا": "Reduced Beta-Blocker Efficacy. Loss of rate/pressure control.",
    "زيادة خطر الفشل الكلوي.": "Renal Failure Risk. Acute kidney injury.",
    "زيادة تثبيط الجهاز العصبي المركزي والسمية.": "Severe CNS Depression. Coma and respiratory failure.",
    "زيادة خطر النزف": "Bleeding Risk. Hemorrhage.",
    "زيادة التثبيط العصبي المركزي": "Increased CNS Depression. Drowsiness and ataxia.",
    "ارتفاع حاد في ضغط الدم": "Hypertensive Crisis. Severe BP elevation.",
    "فشل في علاج العدوى البكتيرية.": "Treatment Failure. Persistent infection.",
    "انخفاض فعالية الكورتيكوستيرويدات": "Reduced Steroid Efficacy. Flare of underlying condition.",
    "تسمم بالليثيوم.": "Lithium Toxicity. Tremor, confusion, renal failure.",
    "تقليل فعالية المضادات الحيوية": "Reduced Antibiotic Efficacy. Bacterial resistance or failure.",
    "زيادة خطر استطالة فترة QT واضطراب نظم قلبي خطير يهدد الحياة.": "Fatal Arrhythmia Risk. Torsades de Pointes.",
    "تقليل فعالية المضاد الحيوي.": "Antibiotic Failure. Suboptimal killing.",
    "زيادة سمية الليثيوم": "Lithium Toxicity. Narrow therapeutic index.",
    "انخفاض تأثير الفيلوديبين - فقدان السيطرة على ضغط الدم": "Uncontrolled Hypertension. Reduced felodipine effect.",
    "زيادة خطر استطالة فترة QT واضطراب نظم قلبي خطير.": "QT Prolongation Risk. Ventricular arrhythmias.",
    "تقليل فعالية خفض ضغط الدم": "Reduced Antihypertensive Effect. Elevated BP.",
    "زيادة خطر انخفاض ضغط الدم الانتصابي - دوخة - دوار - احتمال السقوط": "Orthostatic Hypotension. Fall risk.",
    "زيادة خطر فقدان السمع أو تلف الأذن الداخلية.": "Hearing Loss. Permanent ototoxicity.",
    "زيادة خطر ارتفاع ضغط الدم واضطراب نظم القلب": "Hypertension & Arrhythmia. Cardiovascular instability.",
    "فشل كلوي.": "Renal Failure. Kidney shutdown.",
    "زيادة السمية الوعائية": "Vascular Toxicity. Ischemia or vasospasm.",
    "احتمالية ضعيفة لتقليل فعالية حبوب منع الحمل.": "Potential Contraceptive Failure. Risk of pregnancy.",
    "ارتفاع ضغط الدم": "Hypertension. Elevated blood pressure.",
    "انخفاض فعالية حاصرات قنوات الكالسيوم": "Reduced CCB Efficacy. Poor BP/Angina control.",
    "زيادة خطر النزيف": "Bleeding Risk. Hemorrhage.",
    "تقليل امتصاص المضادات الحيوية": "Reduced Antibiotic Absorption. Treatment failure.",
    "نزيف.": "Hemorrhage. Bleeding.",
    "انخفاض الفعالية العلاجية وزيادة الآثار الجانبية": "Reduced Efficacy & Increased Toxicity. Poor therapeutic index.",
    "تقليل امتصاص كلا الدوائين": "Mutual Malabsorption. Therapeutic failure.",
    "زيادة سمية التاكروليموس": "Tacrolimus Toxicity. Nephro/Neurotoxicity.",
    "فقدان السيطرة على ضغط الدم - زيادة خطر الإصابة بأزمة ارتفاع ضغط": "Hypertensive Crisis Risk. Loss of BP control.",
    "انخفاض تأثير النيفيديبين - فقدان السيطرة على ضغط الدم": "Uncontrolled BP (Nifedipine). Therapeutic failure.",
    "تفاقم الفشل.": "Worsening Failure. Exacerbation of condition.",
    "نزيف معدي، ثقب في المعدة، ألم شديد.": "GI Bleeding & Perforation. Severe gastric injury.",
    "زيادة السمية الهضمية والكلوية": "GI & Renal Toxicity. Combined organ damage.",
    "انحلال عضلات.": "Rhabdomyolysis. Muscle breakdown.",
    "سمية الميثوتريكسات.": "Methotrexate Toxicity. Bone marrow/liver/lung damage.",
    "زيادة خطر متلازمة السيروتونين": "Serotonin Syndrome Risk. Potentially fatal.",

    // Management
    "مراقبة العلامات الحيوية": "Monitor Vital Signs. Check BP and Heart Rate regularly.",
    "قلل جرعة الآزوثيوبرين 75%.": "Reduce Azathioprine Dose by 75%. Essential to prevent marrow toxicity.",
    "تجنب الجمع إذا أمكن، أو مراقبة ظهور الطفح الجلدي.": "Avoid or Monitor for Rash. Consider alternative antibiotics.",
    "تجنب الجمع.": "Avoid Combination. Contraindicated due to high risk.",
    "مراقبة.": "Monitor. Close clinical observation required.",
    "تعديل الجرعة.": "Adjust Dose. Titrate based on response/levels.",
    "فصل الجرعات.": "Separate Doses. Administer at least 2-4 hours apart.",
    "مراقبة وظائف الكلى.": "Monitor Renal Function. Check Creatinine/BUN.",
    "مراقبة البوتاسيوم.": "Monitor Potassium. Check serum K+ levels.",
    "مراقبة ضغط الدم.": "Monitor Blood Pressure. Ensure BP control.",
    "مراقبة السكر.": "Monitor Blood Glucose. Watch for hypoglycemia.",
    "مراقبة مستويات الدواء.": "Therapeutic Drug Monitoring. Check serum levels.",
    "تجنب الجمع أو مراقبة دقيقة.": "Avoid or Monitor Closely. Use with extreme caution.",
    "استخدام بديل.": "Use Alternative. Select a non-interacting agent.",
    "مراقبة تخطيط القلب.": "Monitor ECG. Watch for QT prolongation.",
    "فصل الجرعات بساعتين على الأقل.": "Separate by >2 Hours. Prevent chelation in gut.",
    "مراقبة INR.": "Monitor INR. Adjust warfarin dose as needed.",
    "مراقبة علامات النزيف.": "Monitor for Bleeding. Watch for bruising/melena.",
    "مراقبة السمع.": "Monitor Hearing. Audiometry if prolonged use.",
    "مراقبة وظائف الكبد.": "Monitor Liver Function. Check LFTs.",
    "مراقبة التنفس.": "Monitor Respiration. Watch for respiratory depression.",
    "تجنب القيادة.": "Avoid Driving. Due to sedation/dizziness.",
    "تناول مع الطعام.": "Take with Food. To reduce GI upset.",
    "تناول على معدة فارغة.": "Take on Empty Stomach. To maximize absorption.",
    "مراقبة الوزن.": "Monitor Weight. Watch for fluid retention.",
    "مراقبة الأعراض.": "Monitor Symptoms. Clinical vigilance.",
    "إيقاف الدواء.": "Discontinue Drug. If toxicity occurs.",
    "استشارة الطبيب.": "Consult Physician. For dose adjustment.",
    "تعديل جرعة الوارفارين.": "Adjust Warfarin Dose. Based on INR.",
    "تعديل جرعة الديجوكسين.": "Adjust Digoxin Dose. Based on levels/ECG.",
    "تعديل جرعة الأنسولين.": "Adjust Insulin Dose. Based on glucose logs.",
    "مراقبة الشوارد.": "Monitor Electrolytes. Na, K, Mg.",
    "مراقبة العد الدموي.": "Monitor CBC. Watch for marrow suppression.",
    "مراقبة الحرارة.": "Monitor Temperature. Watch for fever (infection/serotonin syndrome).",
    "مراقبة الحالة العقلية.": "Monitor Mental Status. Watch for confusion/sedation.",
    "تجنب الكحول.": "Avoid Alcohol. Increases CNS depression.",
    "تجنب الحمل.": "Avoid Pregnancy. Use effective contraception.",
    "مراقبة النمو.": "Monitor Growth. In children.",
    "مراقبة العضلات.": "Monitor Muscle Pain. Watch for myopathy.",
    "شرب سوائل كثيرة.": "Hydrate Well. To prevent crystalluria/toxicity.",
    "تجنب الشمس.": "Avoid Sun Exposure. Phototoxicity risk.",
    "مراقبة ضغط العين.": "Monitor IOP. In glaucoma patients.",
    "مراقبة النبض.": "Monitor Pulse. Watch for bradycardia/tachycardia."
};

function applyTranslations() {
    let content = fs.readFileSync(databasePath, 'utf8');
    let count = 0;

    // Regex to find add() calls
    const pattern = /add\s*\(\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*([^,]+),\s*([^,]+),\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*'([^']+)'\s*\)/g;

    content = content.replace(pattern, (match, drugA, drugB, type, severity, mechAr, mechEn, effAr, effEn, manAr, manEn) => {
        let newMechEn = mechEn;
        let newEffEn = effEn;
        let newManEn = manEn;
        let changed = false;

        // Check Mechanism
        if (mechAr.trim() === mechEn.trim()) {
            const translation = dictionary[mechAr.trim()];
            if (translation) {
                newMechEn = translation;
                changed = true;
            }
        }

        // Check Effect
        if (effAr.trim() === effEn.trim()) {
            const translation = dictionary[effAr.trim()];
            if (translation) {
                newEffEn = translation;
                changed = true;
            }
        }

        // Check Management
        if (manAr.trim() === manEn.trim()) {
            const translation = dictionary[manAr.trim()];
            if (translation) {
                newManEn = translation;
                changed = true;
            }
        }

        if (changed) {
            count++;
            return `add('${drugA}', '${drugB}', ${type}, ${severity}, '${mechAr}', '${newMechEn}', '${effAr}', '${newEffEn}', '${manAr}', '${newManEn}')`;
        }

        return match;
    });

    fs.writeFileSync(databasePath, content, 'utf8');
    console.log(`Updated ${count} interactions with enhanced English translations.`);
}

applyTranslations();
