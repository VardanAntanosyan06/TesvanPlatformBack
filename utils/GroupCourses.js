const GroupCourses = [
  {
    bought: 0,
    startDate: new Date(),
    img: "/images/Courses.png",
    sale: 0,
    createdAt:new Date(),
    updatedAt:new Date()
  },
  {
    bought: 10,
    startDate: new Date(),
    img: "/images/Courses.png",
    sale: 4,
    createdAt:new Date(),
    updatedAt:new Date()
  },
  {
    bought: 30,
    startDate: new Date(),
    img: "/images/Courses.png",
    sale: 4,
    createdAt:new Date(),
    updatedAt:new Date()
  },  {
    bought: 1,
    startDate: new Date(),
    img: "/images/Courses.png",
    sale: 4,
    createdAt:new Date(),
    updatedAt:new Date()
  }, {
    bought: 10,
    startDate: new Date(),
    img: "/images/Courses.png",
    sale: 4,
    createdAt:new Date(),
    updatedAt:new Date()
  }, {
    bought: 10,
    startDate: new Date(),
    img: "/images/Courses.png",
    sale: 4,
    createdAt:new Date(),
    updatedAt:new Date()
  },
  {
    bought: 10,
    startDate: new Date(),
    img: "/images/Courses.png",
    sale: 4,
    createdAt:new Date(),
    updatedAt:new Date()
  },
];

const GroupCorsesContent = [
  {
    courseId:1,
    language: "en",
    title: "Automation testing",
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum",
    courseType: "Group",
    lessonType: "Online",
    level: "Beginner",
    price: 75,
  },
  {
    courseId:1,
    language: "ru",
    title: "Автоматизированное тестирование",
    description:
      "«Lorem Ipsum — это просто фиктивный текст полиграфической и наборной промышленности. Lorem Ipsum был стандартным фиктивным текстом в отрасли с 1500-х годов, когда неизвестный печатник взял гранку шрифта и перемешал ее, чтобы сделать книгу образцов шрифта. Он сохранился. не только пять столетий, но и скачок в электронный набор текста, оставаясь практически неизменным. Он был популяризирован в 1960-х годах с выпуском листов Letraset, содержащих отрывки Lorem Ipsum, а совсем недавно - с помощью программного обеспечения для настольных издательских систем, такого как Aldus PageMaker, включая версии Lorem Ipsum ",
    courseType: "Групповой",
    lessonType: "Онлайн",
    level: "«Начинающий»",
    price: 7500,
  },
  {
    courseId:1,
    language: "am",
    title: "Ավտոմատացված թեստավորում",
    description:
      "«Lorem Ipsum-ը պարզապես տպագրական և տպագրական արդյունաբերության կեղծ տեքստ է: Lorem Ipsum-ը եղել է արդյունաբերության ստանդարտ կեղծ տեքստը դեռևս 1500-ական թվականներից, երբ մի անհայտ տպիչ վերցրեց մի ճաշարան և խառնեց այն, որպեսզի տիպային գիրք պատրաստի: Այն պահպանվել է: ոչ միայն հինգ դար, այլ նաև ցատկ դեպի էլեկտրոնային շարադրություն, որը հիմնականում մնացել է անփոփոխ: Այն հանրաճանաչ դարձավ 1960-ականներին՝ թողարկվելով «Letraset» թերթերը, որոնք պարունակում էին Lorem Ipsum հատվածներ, իսկ վերջերս՝ աշխատասեղանի հրատարակման ծրագրակազմով, ինչպիսին է Aldus PageMaker-ը, ներառյալ Lorem Ipsum-ի տարբերակները",
    courseType: "Խմբային",
    lessonType: "Առցանց",
    level: "Սկսնակ",
    price: 28900,
  },
  {
    courseId:2,
    language: "en",
    title: "Automation testing",
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum",
    courseType: "Group",
    lessonType: "Online",
    level: "Beginner",
    price: 75,
  },
  {
    courseId:2,
    language: "ru",
    title: "Автоматизированное тестирование",
    description:
      "«Lorem Ipsum — это просто фиктивный текст полиграфической и наборной промышленности. Lorem Ipsum был стандартным фиктивным текстом в отрасли с 1500-х годов, когда неизвестный печатник взял гранку шрифта и перемешал ее, чтобы сделать книгу образцов шрифта. Он сохранился. не только пять столетий, но и скачок в электронный набор текста, оставаясь практически неизменным. Он был популяризирован в 1960-х годах с выпуском листов Letraset, содержащих отрывки Lorem Ipsum, а совсем недавно - с помощью программного обеспечения для настольных издательских систем, такого как Aldus PageMaker, включая версии Lorem Ipsum ",
    courseType: "Групповой",
    lessonType: "Онлайн",
    level: "«Начинающий»",
    price: 7500,
  },
  {
    courseId:2,
    language: "am",
    title: "Ավտոմատացված թեստավորում",
    description:
      "«Lorem Ipsum-ը պարզապես տպագրական և տպագրական արդյունաբերության կեղծ տեքստ է: Lorem Ipsum-ը եղել է արդյունաբերության ստանդարտ կեղծ տեքստը դեռևս 1500-ական թվականներից, երբ մի անհայտ տպիչ վերցրեց մի ճաշարան և խառնեց այն, որպեսզի տիպային գիրք պատրաստի: Այն պահպանվել է: ոչ միայն հինգ դար, այլ նաև ցատկ դեպի էլեկտրոնային շարադրություն, որը հիմնականում մնացել է անփոփոխ: Այն հանրաճանաչ դարձավ 1960-ականներին՝ թողարկվելով «Letraset» թերթերը, որոնք պարունակում էին Lorem Ipsum հատվածներ, իսկ վերջերս՝ աշխատասեղանի հրատարակման ծրագրակազմով, ինչպիսին է Aldus PageMaker-ը, ներառյալ Lorem Ipsum-ի տարբերակները",
    courseType: "Խմբային",
    lessonType: "Առցանց",
    level: "Սկսնակ",
    price: 28900,
  },
  {
    courseId:3,
    language: "en",
    title: "Automation testing",
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum",
    courseType: "Group",
    lessonType: "Online",
    level: "Beginner",
    price: 75,
  },
  {
    courseId:3,
    language: "ru",
    title: "Автоматизированное тестирование",
    description:
      "«Lorem Ipsum — это просто фиктивный текст полиграфической и наборной промышленности. Lorem Ipsum был стандартным фиктивным текстом в отрасли с 1500-х годов, когда неизвестный печатник взял гранку шрифта и перемешал ее, чтобы сделать книгу образцов шрифта. Он сохранился. не только пять столетий, но и скачок в электронный набор текста, оставаясь практически неизменным. Он был популяризирован в 1960-х годах с выпуском листов Letraset, содержащих отрывки Lorem Ipsum, а совсем недавно - с помощью программного обеспечения для настольных издательских систем, такого как Aldus PageMaker, включая версии Lorem Ipsum ",
    courseType: "Групповой",
    lessonType: "Онлайн",
    level: "«Начинающий»",
    price: 7500,
  },
  {
    courseId:3,
    language: "am",
    title: "Ավտոմատացված թեստավորում",
    description:
      "«Lorem Ipsum-ը պարզապես տպագրական և տպագրական արդյունաբերության կեղծ տեքստ է: Lorem Ipsum-ը եղել է արդյունաբերության ստանդարտ կեղծ տեքստը դեռևս 1500-ական թվականներից, երբ մի անհայտ տպիչ վերցրեց մի ճաշարան և խառնեց այն, որպեսզի տիպային գիրք պատրաստի: Այն պահպանվել է: ոչ միայն հինգ դար, այլ նաև ցատկ դեպի էլեկտրոնային շարադրություն, որը հիմնականում մնացել է անփոփոխ: Այն հանրաճանաչ դարձավ 1960-ականներին՝ թողարկվելով «Letraset» թերթերը, որոնք պարունակում էին Lorem Ipsum հատվածներ, իսկ վերջերս՝ աշխատասեղանի հրատարակման ծրագրակազմով, ինչպիսին է Aldus PageMaker-ը, ներառյալ Lorem Ipsum-ի տարբերակները",
    courseType: "Խմբային",
    lessonType: "Առցանց",
    level: "Սկսնակ",
    price: 28900,
  },
  {
    courseId:4,
    language: "en",
    title: "Automation testing",
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum",
    courseType: "Group",
    lessonType: "Online",
    level: "Beginner",
    price: 75,
  },
  {
    courseId:4,
    language: "ru",
    title: "Автоматизированное тестирование",
    description:
      "«Lorem Ipsum — это просто фиктивный текст полиграфической и наборной промышленности. Lorem Ipsum был стандартным фиктивным текстом в отрасли с 1500-х годов, когда неизвестный печатник взял гранку шрифта и перемешал ее, чтобы сделать книгу образцов шрифта. Он сохранился. не только пять столетий, но и скачок в электронный набор текста, оставаясь практически неизменным. Он был популяризирован в 1960-х годах с выпуском листов Letraset, содержащих отрывки Lorem Ipsum, а совсем недавно - с помощью программного обеспечения для настольных издательских систем, такого как Aldus PageMaker, включая версии Lorem Ipsum ",
    courseType: "Групповой",
    lessonType: "Онлайн",
    level: "«Начинающий»",
    price: 7500,
  },
  {
    courseId:4,
    language: "am",
    title: "Ավտոմատացված թեստավորում",
    description:
      "«Lorem Ipsum-ը պարզապես տպագրական և տպագրական արդյունաբերության կեղծ տեքստ է: Lorem Ipsum-ը եղել է արդյունաբերության ստանդարտ կեղծ տեքստը դեռևս 1500-ական թվականներից, երբ մի անհայտ տպիչ վերցրեց մի ճաշարան և խառնեց այն, որպեսզի տիպային գիրք պատրաստի: Այն պահպանվել է: ոչ միայն հինգ դար, այլ նաև ցատկ դեպի էլեկտրոնային շարադրություն, որը հիմնականում մնացել է անփոփոխ: Այն հանրաճանաչ դարձավ 1960-ականներին՝ թողարկվելով «Letraset» թերթերը, որոնք պարունակում էին Lorem Ipsum հատվածներ, իսկ վերջերս՝ աշխատասեղանի հրատարակման ծրագրակազմով, ինչպիսին է Aldus PageMaker-ը, ներառյալ Lorem Ipsum-ի տարբերակները",
    courseType: "Խմբային",
    lessonType: "Առցանց",
    level: "Սկսնակ",
    price: 28900,
  },
  {
    courseId:5,
    language: "en",
    title: "Automation testing",
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum",
    courseType: "Group",
    lessonType: "Online",
    level: "Beginner",
    price: 75,
  },
  {
    courseId:5,
    language: "ru",
    title: "Автоматизированное тестирование",
    description:
      "«Lorem Ipsum — это просто фиктивный текст полиграфической и наборной промышленности. Lorem Ipsum был стандартным фиктивным текстом в отрасли с 1500-х годов, когда неизвестный печатник взял гранку шрифта и перемешал ее, чтобы сделать книгу образцов шрифта. Он сохранился. не только пять столетий, но и скачок в электронный набор текста, оставаясь практически неизменным. Он был популяризирован в 1960-х годах с выпуском листов Letraset, содержащих отрывки Lorem Ipsum, а совсем недавно - с помощью программного обеспечения для настольных издательских систем, такого как Aldus PageMaker, включая версии Lorem Ipsum ",
    courseType: "Групповой",
    lessonType: "Онлайн",
    level: "«Начинающий»",
    price: 7500,
  },
  {
    courseId:5,
    language: "am",
    title: "Ավտոմատացված թեստավորում",
    description:
      "«Lorem Ipsum-ը պարզապես տպագրական և տպագրական արդյունաբերության կեղծ տեքստ է: Lorem Ipsum-ը եղել է արդյունաբերության ստանդարտ կեղծ տեքստը դեռևս 1500-ական թվականներից, երբ մի անհայտ տպիչ վերցրեց մի ճաշարան և խառնեց այն, որպեսզի տիպային գիրք պատրաստի: Այն պահպանվել է: ոչ միայն հինգ դար, այլ նաև ցատկ դեպի էլեկտրոնային շարադրություն, որը հիմնականում մնացել է անփոփոխ: Այն հանրաճանաչ դարձավ 1960-ականներին՝ թողարկվելով «Letraset» թերթերը, որոնք պարունակում էին Lorem Ipsum հատվածներ, իսկ վերջերս՝ աշխատասեղանի հրատարակման ծրագրակազմով, ինչպիսին է Aldus PageMaker-ը, ներառյալ Lorem Ipsum-ի տարբերակները",
    courseType: "Խմբային",
    lessonType: "Առցանց",
    level: "Սկսնակ",
    price: 28900,
  },
  {
    courseId:6,
    language: "en",
    title: "Automation testing",
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum",
    courseType: "Group",
    lessonType: "Online",
    level: "Beginner",
    price: 75,
  },
  {
    courseId:6,
    language: "ru",
    title: "Автоматизированное тестирование",
    description:
      "«Lorem Ipsum — это просто фиктивный текст полиграфической и наборной промышленности. Lorem Ipsum был стандартным фиктивным текстом в отрасли с 1500-х годов, когда неизвестный печатник взял гранку шрифта и перемешал ее, чтобы сделать книгу образцов шрифта. Он сохранился. не только пять столетий, но и скачок в электронный набор текста, оставаясь практически неизменным. Он был популяризирован в 1960-х годах с выпуском листов Letraset, содержащих отрывки Lorem Ipsum, а совсем недавно - с помощью программного обеспечения для настольных издательских систем, такого как Aldus PageMaker, включая версии Lorem Ipsum ",
    courseType: "Групповой",
    lessonType: "Онлайн",
    level: "«Начинающий»",
    price: 7500,
  },
  {
    courseId:6,
    language: "am",
    title: "Ավտոմատացված թեստավորում",
    description:
      "«Lorem Ipsum-ը պարզապես տպագրական և տպագրական արդյունաբերության կեղծ տեքստ է: Lorem Ipsum-ը եղել է արդյունաբերության ստանդարտ կեղծ տեքստը դեռևս 1500-ական թվականներից, երբ մի անհայտ տպիչ վերցրեց մի ճաշարան և խառնեց այն, որպեսզի տիպային գիրք պատրաստի: Այն պահպանվել է: ոչ միայն հինգ դար, այլ նաև ցատկ դեպի էլեկտրոնային շարադրություն, որը հիմնականում մնացել է անփոփոխ: Այն հանրաճանաչ դարձավ 1960-ականներին՝ թողարկվելով «Letraset» թերթերը, որոնք պարունակում էին Lorem Ipsum հատվածներ, իսկ վերջերս՝ աշխատասեղանի հրատարակման ծրագրակազմով, ինչպիսին է Aldus PageMaker-ը, ներառյալ Lorem Ipsum-ի տարբերակները",
    courseType: "Խմբային",
    lessonType: "Առցանց",
    level: "Սկսնակ",
    price: 28900,
  },
  {
    courseId:7,
    language: "en",
    title: "Automation testing",
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum",
    courseType: "Group",
    lessonType: "Online",
    level: "Beginner",
    price: 75,
  },
  {
    courseId:7,
    language: "ru",
    title: "Автоматизированное тестирование",
    description:
      "«Lorem Ipsum — это просто фиктивный текст полиграфической и наборной промышленности. Lorem Ipsum был стандартным фиктивным текстом в отрасли с 1500-х годов, когда неизвестный печатник взял гранку шрифта и перемешал ее, чтобы сделать книгу образцов шрифта. Он сохранился. не только пять столетий, но и скачок в электронный набор текста, оставаясь практически неизменным. Он был популяризирован в 1960-х годах с выпуском листов Letraset, содержащих отрывки Lorem Ipsum, а совсем недавно - с помощью программного обеспечения для настольных издательских систем, такого как Aldus PageMaker, включая версии Lorem Ipsum ",
    courseType: "Групповой",
    lessonType: "Онлайн",
    level: "«Начинающий»",
    price: 7500,
  },
  {
    courseId:7,
    language: "am",
    title: "Ավտոմատացված թեստավորում",
    description:
      "«Lorem Ipsum-ը պարզապես տպագրական և տպագրական արդյունաբերության կեղծ տեքստ է: Lorem Ipsum-ը եղել է արդյունաբերության ստանդարտ կեղծ տեքստը դեռևս 1500-ական թվականներից, երբ մի անհայտ տպիչ վերցրեց մի ճաշարան և խառնեց այն, որպեսզի տիպային գիրք պատրաստի: Այն պահպանվել է: ոչ միայն հինգ դար, այլ նաև ցատկ դեպի էլեկտրոնային շարադրություն, որը հիմնականում մնացել է անփոփոխ: Այն հանրաճանաչ դարձավ 1960-ականներին՝ թողարկվելով «Letraset» թերթերը, որոնք պարունակում էին Lorem Ipsum հատվածներ, իսկ վերջերս՝ աշխատասեղանի հրատարակման ծրագրակազմով, ինչպիսին է Aldus PageMaker-ը, ներառյալ Lorem Ipsum-ի տարբերակները",
    courseType: "Խմբային",
    lessonType: "Առցանց",
    level: "Սկսնակ",
    price: 28900,
  },
];

module.exports = {
  GroupCourses,
  GroupCorsesContent,
};
