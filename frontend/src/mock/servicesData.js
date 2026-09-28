/*
 * Mock data dùng chung cho nền tảng GiúpViệc24 (giai đoạn chưa nối Backend API).
 * Nguồn dữ liệu duy nhất cho: ServicesPage, ServicesSection (Home) và BookingModal.
 */

/* Mã dịch vụ (enum) */
export const SERVICE_CODES = {
  CLEANING_HOURLY: 'CLEANING_HOURLY',
  DEEP_CLEANING: 'DEEP_CLEANING',
  PARTY_CLEANUP: 'PARTY_CLEANUP',
  COOKING: 'COOKING',
  LAUNDRY: 'LAUNDRY',
  BABYSITTING: 'BABYSITTING',
  ELDERLY_CARE: 'ELDERLY_CARE',
  APPLIANCE_CLEANING: 'APPLIANCE_CLEANING',
  OFFICE_CLEANING: 'OFFICE_CLEANING',
  CLEANING_PACKAGE: 'CLEANING_PACKAGE',
};

/* Type giá */
export const PRICING_TYPES = {
  HOURLY: 'HOURLY',
  FIXED_SQM: 'FIXED_SQM',
  PACKAGE: 'PACKAGE',
};

/* Danh mục dịch vụ (category) */
export const SERVICE_CATEGORIES = [
  'Dọn dẹp',
  'Nấu ăn',
  'Giặt ủi',
  'Trông trẻ',
  'Chăm sóc',
  'Sửa chữa - Điện máy',
];

/* Khu vực hệ thống đang phục vụ */
export const SERVICE_AREAS = ['Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Tỉnh/Thành khác'];

/* ---------- Helper format ---------- */
export const formatVND = (value) => `${Number(value || 0).toLocaleString('vi-VN')}đ`;

/* ---------- Factory tạo option & field cho bookingFormConfig ---------- */
const opt = (label, extra = {}) => ({ value: label, label, ...extra });
const labels = (options) => options.map((item) => item.label);

const sel = (key, label, options, extra = {}) => ({
  key, label, type: 'select', options, ...extra,
});
const multi = (key, label, options, extra = {}) => ({
  key, label, type: 'multi', options, ...extra,
});
const toggle = (key, label, extraFee = 0, extra = {}) => ({
  key, label, type: 'toggle', extraFee, ...extra,
});
const num = (key, label, unitPrice, extra = {}) => ({
  key, label, type: 'number', unitPrice, min: 1, max: 20, ...extra,
});

/* ---------- Option dùng chung ---------- */
export const M2_AREA_OPTIONS = [
  opt('Dưới 50m² (Studio/1PN)', { sqm: 45 }),
  opt('55 - 85m² (2PN)', { sqm: 70 }),
  opt('85 - 105m² (3PN)', { sqm: 95 }),
  opt('Trên 105m² / Nhà tầng', { sqm: 130 }),
];

export const PRIORITY_OPTIONS = [
  opt('Phòng khách'),
  opt('Nhà bếp'),
  opt('Toilet'),
  opt('Phòng ngủ'),
  opt('Ban công'),
];

export const TASTE_STYLE_OPTIONS = [
  opt('Khẩu vị Miền Bắc'),
  opt('Khẩu vị Miền Trung'),
  opt('Khẩu vị Miền Nam'),
  opt('Ăn chay/Kiêng'),
];

export const EATER_COUNT_OPTIONS = [
  opt('1-2 người'),
  opt('3-4 người', { extraFee: 30000 }),
  opt('5-6 người', { extraFee: 60000 }),
  opt('Trên 6 người', { extraFee: 100000 }),
];

export const CHILD_AGE_OPTIONS = [
  opt('Dưới 1 tuổi'),
  opt('1 - 3 tuổi'),
  opt('4 - 6 tuổi'),
  opt('Trên 6 tuổi'),
];

export const CAREGIVER_GENDER_OPTIONS = [
  opt('Ưu tiên Nữ'),
  opt('Ưu tiên Nam'),
  opt('Không yêu cầu'),
];

/* ---------- Người giúp việc mẫu (dùng cho lựa chọn "Chọn nhân viên cụ thể") ---------- */
export const mockWorkers = [
  { id: 'W-01', name: 'Nguyễn Thị Lan', rating: 4.9, skills: ['Dọn dẹp', 'Nấu ăn'], area: 'Hà Nội', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=70' },
  { id: 'W-02', name: 'Trần Thị Hương', rating: 4.8, skills: ['Dọn dẹp', 'Giặt ủi'], area: 'Hà Nội', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=70' },
  { id: 'W-03', name: 'Lê Thị Mai', rating: 4.9, skills: ['Nấu ăn', 'Chăm sóc trẻ'], area: 'TP. Hồ Chí Minh', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=70' },
  { id: 'W-04', name: 'Phạm Thị Dung', rating: 4.7, skills: ['Chăm sóc người già', 'Dọn dẹp'], area: 'Hà Nội', avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=200&q=70' },
  { id: 'W-05', name: 'Đặng Văn Kiên', rating: 4.7, skills: ['Tổng vệ sinh', 'Điện máy'], area: 'TP. Hồ Chí Minh', avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=70' },
];

export const mockServices = [
  {
    id: 'SVC-001',
    serviceCode: SERVICE_CODES.CLEANING_HOURLY,
    title: 'Dọn dẹp nhà theo giờ',
    shortDescription: 'Lau dọn phòng khách, hút bụi, lau sàn, cọ rửa nhà vệ sinh, sắp xếp đồ đạc gọn gàng.',
    category: 'Dọn dẹp',
    imageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=70',
    rating: 4.9,
    reviewCount: 1284,
    pricing: {
      type: PRICING_TYPES.HOURLY,
      pricePerHour: 120000,
      formattedPrice: '120.000đ - 140.000đ / giờ',
      minHours: 2,
      stepHours: [2, 3, 4, 6],
      priceFrom: 120000,
      priceTo: 140000,
      sortPrice: 130000,
    },
    tags: ['Hút bụi', 'Lau kính', 'Vệ sinh toilet', 'Gọn gàng'],
    bookingFormConfig: {
      areaOptions: labels(M2_AREA_OPTIONS),
      priorities: labels(PRIORITY_OPTIONS),
      allowPetOption: true,
      allowToolOption: true,
      fields: [
        sel('areaOption', 'Diện tích nhà', M2_AREA_OPTIONS, { required: true }),
        multi('priorities', 'Khu vực ưu tiên dọn kỹ', PRIORITY_OPTIONS),
        toggle('hasPet', 'Nhà có thú cưng (xử lý lông & khử mùi)', 30000),
        toggle('needTools', 'Cần người giúp việc mang dụng cụ & hoá chất chuyên dụng', 50000),
      ],
    },
    subtitle: 'Nhà cửa luôn tinh tươm, sạch mát',
    description: 'Người giúp việc mang theo quy trình dọn dẹp 5 bước: hút bụi toàn bộ sàn, lau kính & cửa, vệ sinh toilet, lau bếp và sắp xếp lại đồ đạc gọn gàng.',
    iconKey: 'Sparkles',
    themeClass: 'bg-blue-50 text-blue-600 border-blue-100',
    areas: ['Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng'],
    bookingCount: 3210,
    isPackage: false,
  },
  {
    id: 'SVC-002',
    serviceCode: SERVICE_CODES.DEEP_CLEANING,
    title: 'Tổng vệ sinh / Dọn nhà sau xây dựng',
    shortDescription: 'Vệ sinh công nghiệp nhà mới xây hoặc sửa chữa: lau trần, cọ sàn, tẩy keo xi măng, vệ sinh kính.',
    category: 'Dọn dẹp',
    imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=70',
    rating: 4.8,
    reviewCount: 642,
    pricing: {
      type: PRICING_TYPES.FIXED_SQM,
      pricePerSqm: 25000,
      pricePerHour: 250000,
      formattedPrice: '25.000đ - 35.000đ / m² (đội 2-4 người)',
      minHours: 4,
      stepHours: [4, 6, 8],
      priceFrom: 150000,
      priceTo: 200000,
      sortPrice: 175000,
    },
    tags: ['Tẩy cặn xi măng', 'Vệ sinh kính cao', 'Đánh bóng sàn', 'Khử mùi'],
    bookingFormConfig: {
      areaOptions: labels(M2_AREA_OPTIONS),
      constructionStates: ['Nhà đang ở (dọn sâu định kỳ)', 'Nhà mới xây/sửa chưa dọn'],
      addons: ['Vệ sinh kính & ban công', 'Đánh bóng sàn gỗ/đá', 'Khử mùi & diệt khuẩn', 'Vệ sinh lưới chống muỗi'],
      allowLadderOption: true,
      fields: [
        sel('areaOption', 'Diện tích cần tổng vệ sinh', M2_AREA_OPTIONS, { required: true }),
        sel('constructionState', 'Tình trạng nhà', [
          opt('Nhà đang ở (dọn sâu định kỳ)'),
          opt('Nhà mới xây/sửa chưa dọn', { extraFee: 500000 }),
        ], { required: true }),
        multi('addons', 'Hạng mục cần làm thêm', [
          opt('Vệ sinh kính & ban công', { extraFee: 150000 }),
          opt('Đánh bóng sàn gỗ/đá', { extraFee: 250000 }),
          opt('Khử mùi & diệt khuẩn', { extraFee: 120000 }),
          opt('Vệ sinh lưới chống muỗi', { extraFee: 80000 }),
        ]),
        toggle('needLadder', 'Cần thang/giàn giáo cho trần cao trên 4m', 100000),
      ],
    },
    subtitle: 'Sạch bóng từ trần đến chân tường',
    description: 'Đội 2-4 nhân sự cùng thiết bị công nghiệp (máy hút bụi nước, máy chà sàn) xử lý cặn xi măng, keo dính và bụi mịn còn lại sau khi hoàn thiện.',
    iconKey: 'SprayCan',
    themeClass: 'bg-sky-50 text-sky-600 border-sky-100',
    areas: ['Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng'],
    bookingCount: 1580,
    isPackage: false,
  },
  {
    id: 'SVC-003',
    serviceCode: SERVICE_CODES.PARTY_CLEANUP,
    title: 'Dọn dẹp sau tiệc / sự kiện',
    shortDescription: 'Thu gom chén đĩa, ly cốc, rác và trang trí; lau sàn, khử mùi đồ ăn và dọn bàn ghế về vị trí ban đầu.',
    category: 'Dọn dẹp',
    imageUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=800&q=70',
    rating: 4.7,
    reviewCount: 386,
    pricing: {
      type: PRICING_TYPES.HOURLY,
      pricePerHour: 150000,
      formattedPrice: '150.000đ - 180.000đ / giờ',
      minHours: 2,
      stepHours: [2, 3, 4, 6],
      priceFrom: 150000,
      priceTo: 180000,
      sortPrice: 165000,
    },
    tags: ['Rửa bát đĩa', 'Thu gom rác', 'Khử mùi', 'Dọn bàn tiệc'],
    bookingFormConfig: {
      guestCountOptions: ['Dưới 20 khách', '20 - 50 khách', '50 - 100 khách', 'Trên 100 khách'],
      cleanupScopes: ['Dọn bàn ghế & trang trí', 'Rửa bát đĩa & ly cốc', 'Thu gom rác & đổ rác', 'Lau sàn & hút bụi', 'Vệ sinh toilet'],
      allowOvertimeOption: true,
      fields: [
        sel('guestCount', 'Quy mô tiệc', [
          opt('Dưới 20 khách'),
          opt('20 - 50 khách', { extraFee: 100000 }),
          opt('50 - 100 khách', { extraFee: 250000 }),
          opt('Trên 100 khách', { extraFee: 450000 }),
        ], { required: true }),
        multi('cleanupScopes', 'Hạng mục cần dọn', [
          opt('Dọn bàn ghế & trang trí'),
          opt('Rửa bát đĩa & ly cốc', { extraFee: 80000 }),
          opt('Thu gom rác & đổ rác'),
          opt('Lau sàn & hút bụi'),
          opt('Vệ sinh toilet', { extraFee: 60000 }),
        ]),
        toggle('urgent', 'Cần dọn gấp trong 2 giờ (ưu tiên điều phối)', 100000),
      ],
    },
    subtitle: 'Tiệc tan, nhà lại gọn như chưa từng có tiệc',
    description: 'Nhóm 2-4 người dọn theo thứ tự: thu gom rác & chai lọ, rửa bát đĩa, lau bàn ghế, hút bụi và khử mùi thức ăn — nhà sẵn sàng đón khách mới.',
    iconKey: 'PartyPopper',
    themeClass: 'bg-fuchsia-50 text-fuchsia-600 border-fuchsia-100',
    areas: ['Hà Nội', 'TP. Hồ Chí Minh'],
    bookingCount: 620,
    isPackage: false,
  },
  {
    id: 'SVC-004',
    serviceCode: SERVICE_CODES.COOKING,
    title: 'Nấu ăn gia đình',
    shortDescription: 'Đi chợ theo yêu cầu, sơ chế thực phẩm tươi ngon, nấu món hợp khẩu vị gia đình và dọn rửa bát đĩa.',
    category: 'Nấu ăn',
    imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=800&q=70',
    rating: 4.8,
    reviewCount: 986,
    pricing: {
      type: PRICING_TYPES.HOURLY,
      pricePerHour: 130000,
      formattedPrice: '130.000đ - 150.000đ / giờ',
      minHours: 2,
      stepHours: [2, 3, 4, 6],
      priceFrom: 130000,
      priceTo: 150000,
      sortPrice: 140000,
    },
    tags: ['Đi chợ', 'Nấu món Bắc - Trung - Nam', 'Dọn bếp'],
    bookingFormConfig: {
      mealTypes: ['Bữa trưa', 'Bữa tối'],
      eaterCountOptions: labels(EATER_COUNT_OPTIONS),
      tasteStyles: labels(TASTE_STYLE_OPTIONS),
      allowGroceryShopping: true,
      groceryAdvanceOptions: ['Tạm ứng 200.000đ', 'Tạm ứng 300.000đ', 'Tạm ứng 500.000đ'],
      fields: [
        multi('mealTypes', 'Bữa cần nấu', [opt('Bữa trưa'), opt('Bữa tối')], { required: true }),
        sel('eaterCount', 'Số người ăn', EATER_COUNT_OPTIONS, { required: true }),
        sel('tasteStyle', 'Khẩu vị mong muốn', TASTE_STYLE_OPTIONS, { required: true }),
        toggle('groceryShopping', 'Người giúp việc đi chợ trước giờ nấu'),
        sel('groceryBudget', 'Ngân sách tạm ứng đi chợ', [
          opt('Tạm ứng 200.000đ', { extraFee: 200000, advance: true }),
          opt('Tạm ứng 300.000đ', { extraFee: 300000, advance: true }),
          opt('Tạm ứng 500.000đ', { extraFee: 500000, advance: true }),
        ], { hideWhen: 'groceryShopping', hint: 'Tiền tạm ứng được quyết toán theo hoá đơn, hoàn lại phần chưa dùng.' }),
      ],
    },
    subtitle: 'Bữa cơm chuẩn vị mẹ nấu, dinh dưỡng',
    description: 'Thực đơn 3-4 món (mặn, xào, canh, tráng miệng) được chốt trước qua ghi chú; nguyên liệu tươi mua trong ngày, bếp được dọn sạch sau khi nấu.',
    iconKey: 'UtensilsCrossed',
    themeClass: 'bg-amber-50 text-amber-600 border-amber-100',
    areas: ['Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng'],
    bookingCount: 2480,
    isPackage: false,
  },
  {
    id: 'SVC-005',
    serviceCode: SERVICE_CODES.LAUNDRY,
    title: 'Giặt ủi, phơi & gấp quần áo',
    shortDescription: 'Phân loại đồ trắng - màu, giặt máy/giặt tay đồ nhạy cảm, phơi nắng thơm mát, là ủi và xếp tủ.',
    category: 'Giặt ủi',
    imageUrl: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=800&q=70',
    rating: 4.7,
    reviewCount: 438,
    pricing: {
      type: PRICING_TYPES.HOURLY,
      pricePerHour: 110000,
      formattedPrice: '110.000đ - 130.000đ / giờ',
      minHours: 2,
      stepHours: [2, 3, 4, 6],
      priceFrom: 110000,
      priceTo: 130000,
      sortPrice: 120000,
    },
    tags: ['Là ủi áo sơ mi', 'Phân loại vải', 'Xếp tủ ngăn nắp'],
    bookingFormConfig: {
      laundryModes: ['Giặt bằng máy của khách tại nhà', 'Gom đồ mang đi sấy & giao lại'],
      ironingOption: true,
      ironingPricePerItem: 15000,
      fields: [
        sel('laundryMode', 'Hình thức giặt', [
          opt('Giặt bằng máy của khách tại nhà'),
          opt('Gom đồ mang đi sấy & giao lại', { extraFee: 40000 }),
        ], { required: true }),
        toggle('ironingOption', 'Có ủi/là quần áo'),
        num('ironingCount', 'Số bộ áo/quần âu cần ủi', 15000, {
          hideWhen: 'ironingOption',
          hint: '15.000đ/bộ, tối thiểu 3 bộ.',
          min: 3,
        }),
        toggle('delicateCare', 'Có đồ nhạy cảm cần giặt tay riêng (lụa, len, đồ bé)', 25000),
      ],
    },
    subtitle: 'Tiện lợi, thơm tho, nhanh chóng',
    description: 'Đồ được phân loại theo màu & chất liệu, giặt đúng chế độ, phơi trong bóng râm với đồ nhạy cảm và là ủi phẳng phiu trước khi xếp vào tủ.',
    iconKey: 'Shirt',
    themeClass: 'bg-purple-50 text-purple-600 border-purple-100',
    areas: ['Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng'],
    bookingCount: 1150,
    isPackage: false,
  },
  {
    id: 'SVC-006',
    serviceCode: SERVICE_CODES.BABYSITTING,
    title: 'Chăm sóc trẻ nhỏ - Babysitting',
    shortDescription: 'Cho bé ăn uống đúng giờ, tắm rửa, chơi và học cùng bé, đưa đón đi học và giám sát an toàn.',
    category: 'Trông trẻ',
    imageUrl: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=800&q=70',
    rating: 4.9,
    reviewCount: 742,
    pricing: {
      type: PRICING_TYPES.HOURLY,
      pricePerHour: 140000,
      formattedPrice: '140.000đ - 160.000đ / giờ',
      minHours: 2,
      stepHours: [2, 3, 4, 6],
      priceFrom: 140000,
      priceTo: 160000,
      sortPrice: 150000,
    },
    tags: ['Kinh nghiệm trông trẻ', 'Tập ăn dặm', 'Đưa đón'],
    bookingFormConfig: {
      childrenAgeRanges: ['Dưới 1 tuổi', '1 - 3 tuổi', '4 - 6 tuổi', 'Trên 6 tuổi'],
      tasks: ['Cho ăn/bú bình', 'Tắm rửa & vệ sinh', 'Chơi & học cùng bé', 'Đưa đón đi học'],
      guardianPresence: ['Bố mẹ vắng nhà', 'Bố mẹ có mặt ở phòng khác'],
      fields: [
        multi('childrenAgeRanges', 'Độ tuổi của bé', CHILD_AGE_OPTIONS, { required: true }),
        num('childrenCount', 'Số bé cần chăm sóc', 50000, { freeUnits: 1, hint: 'Bé đầu tiên miễn phí, bé thứ 2 trở đi phụ thu 50.000đ/bé.' }),
        multi('tasks', 'Công việc cần làm', [
          opt('Cho ăn/bú bình'),
          opt('Tắm rửa & vệ sinh'),
          opt('Chơi & học cùng bé'),
          opt('Đưa đón đi học', { extraFee: 40000 }),
        ]),
        sel('guardianPresence', 'Người lớn trong nhà', [
          opt('Bố mẹ vắng nhà'),
          opt('Bố mẹ có mặt ở phòng khác'),
        ], { required: true }),
        toggle('mealPrep', 'Nấu ăn dặm cho bé trong ca làm', 30000),
      ],
    },
    subtitle: 'Yêu thương, an toàn, tận tâm',
    description: 'Người chăm sóc có chứng chỉ sơ cấp dưỡng, được tập huấn sơ cứu trẻ em; báo cáo hoạt động của bé (ăn, ngủ, vệ sinh) sau mỗi ca.',
    iconKey: 'Baby',
    themeClass: 'bg-rose-50 text-rose-500 border-rose-100',
    areas: ['Hà Nội', 'TP. Hồ Chí Minh'],
    bookingCount: 1690,
    isPackage: false,
  },
  {
    id: 'SVC-007',
    serviceCode: SERVICE_CODES.ELDERLY_CARE,
    title: 'Chăm sóc người cao tuổi & người bệnh',
    shortDescription: 'Hỗ trợ sinh hoạt hàng ngày, nhắc uống thuốc đúng cữ, trò chuyện bầu bạn, xoa bóp và đi dạo nhẹ nhàng.',
    category: 'Chăm sóc',
    imageUrl: 'https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=800&q=70',
    rating: 4.8,
    reviewCount: 615,
    pricing: {
      type: PRICING_TYPES.HOURLY,
      pricePerHour: 150000,
      formattedPrice: '150.000đ - 180.000đ / giờ',
      minHours: 2,
      stepHours: [2, 3, 4, 6],
      priceFrom: 150000,
      priceTo: 180000,
      sortPrice: 165000,
    },
    tags: ['Kiểm tra huyết áp', 'Nhắc thuốc', 'Tâm lý người cao tuổi'],
    bookingFormConfig: {
      patientMobility: ['Tự đi lại được', 'Cần người dìu/xe lăn', 'Nằm liệt giường'],
      caregiverGenderReq: ['Ưu tiên Nữ', 'Ưu tiên Nam', 'Không yêu cầu'],
      specialSkills: ['Thay bỉm tại giường', 'Xoa bóp vật lý trị liệu', 'Nhắc uống thuốc'],
      fields: [
        sel('patientMobility', 'Khả năng vận động của người được chăm sóc', [
          opt('Tự đi lại được'),
          opt('Cần người dìu/xe lăn', { extraFee: 50000 }),
          opt('Nằm liệt giường', { extraFee: 120000 }),
        ], { required: true }),
        sel('caregiverGenderReq', 'Giới tính người chăm sóc', CAREGIVER_GENDER_OPTIONS, { required: true }),
        multi('specialSkills', 'Kỹ năng chuyên môn cần có', [
          opt('Thay bỉm tại giường', { extraFee: 30000 }),
          opt('Xoa bóp vật lý trị liệu', { extraFee: 80000 }),
          opt('Nhắc uống thuốc'),
        ]),
        toggle('healthMonitoring', 'Theo dõi huyết áp/đường huyết và ghi chép sổ sức khoẻ', 40000),
        toggle('nightShift', 'Ca đêm 22:00 - 06:00 (hỗ trợ xoay trở, đi vệ sinh)', 80000),
      ],
    },
    subtitle: 'Ân cần, chu đáo, hiểu tâm lý',
    description: 'Người chăm sóc được đào tạo kỹ năng chăm sóc cơ bản, biết nhận diện dấu hiệu bất thường về sức khoẻ và liên hệ y tế kịp thời khi cần.',
    iconKey: 'UserCheck',
    themeClass: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    areas: ['Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng'],
    bookingCount: 1320,
    isPackage: false,
  },
  {
    id: 'SVC-008',
    serviceCode: SERVICE_CODES.APPLIANCE_CLEANING,
    title: 'Vệ sinh máy lạnh / Điện máy',
    shortDescription: 'Tháo lắp, vệ sinh dàn lạnh, đường ống và lưới lọc; kiểm tra gas, diệt khuẩn và hút ẩm đúng kỹ thuật.',
    category: 'Sửa chữa - Điện máy',
    imageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=70',
    rating: 4.6,
    reviewCount: 318,
    pricing: {
      type: PRICING_TYPES.PACKAGE,
      packagePrice: 250000,
      pricePerHour: 250000,
      formattedPrice: '200.000đ - 350.000đ / thiết bị',
      minHours: 1,
      stepHours: [1, 2, 3],
      priceFrom: 200000,
      priceTo: 350000,
      sortPrice: 275000,
    },
    tags: ['Vệ sinh dàn lạnh', 'Kiểm tra gas', 'Diệt khuẩn lưới lọc'],
    bookingFormConfig: {
      applianceTypes: ['Máy lạnh treo tường', 'Máy lạnh tủ đứng/âm trần', 'Tủ lạnh', 'Máy giặt'],
      unitCountOptions: ['1 thiết bị', '2 thiết bị', '3 thiết bị', 'Trên 3 thiết bị'],
      fields: [
        sel('applianceType', 'Loại thiết bị', [
          opt('Máy lạnh treo tường'),
          opt('Máy lạnh tủ đứng/âm trần', { extraFee: 250000 }),
          opt('Tủ lạnh', { extraFee: 50000 }),
          opt('Máy giặt', { extraFee: 100000 }),
        ], { required: true }),
        num('unitCount', 'Số thiết bị cần vệ sinh', 250000, { role: 'units', hint: 'Giá cơ bản mỗi thiết bị, nhân theo số lượng.' }),
        toggle('needGasCheck', 'Kiểm tra & bổ sung gas nếu thiếu', 150000),
        toggle('warranty7Days', 'Bảo hành vệ sinh 7 ngày (sạch lại nếu chưa đạt)', 20000),
      ],
    },
    subtitle: 'Mát lạnh, sạch khuẩn, tiết kiệm điện',
    description: 'Kỹ thuật viên mang theo máy phun áp lực & bạt chống nước, vệ sinh tại chỗ không cần tháo máy về xưởng, dọn sạch khu vực sau khi xong.',
    iconKey: 'AirVent',
    themeClass: 'bg-cyan-50 text-cyan-600 border-cyan-100',
    areas: ['Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng'],
    bookingCount: 690,
    isPackage: false,
  },
  {
    id: 'SVC-009',
    serviceCode: SERVICE_CODES.OFFICE_CLEANING,
    title: 'Vệ sinh văn phòng định kỳ',
    shortDescription: 'Dọn dẹp bàn làm việc, phòng họp, khu vực pantry, hút thảm và vệ sinh toilet cho văn phòng dưới 200m².',
    category: 'Dọn dẹp',
    imageUrl: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&w=800&q=70',
    rating: 4.6,
    reviewCount: 254,
    pricing: {
      type: PRICING_TYPES.HOURLY,
      pricePerHour: 100000,
      formattedPrice: '100.000đ - 120.000đ / giờ',
      minHours: 2,
      stepHours: [2, 3, 4, 6],
      priceFrom: 100000,
      priceTo: 120000,
      sortPrice: 110000,
    },
    tags: ['Hút thảm', 'Vệ sinh pantry', 'Dọn phòng họp', 'Ngoài giờ'],
    bookingFormConfig: {
      officeSizeOptions: ['Dưới 80m²', '80 - 150m²', '150 - 200m²', 'Trên 200m²'],
      frequencyOptions: ['Một lần', 'Hàng tuần - 2 buổi/tuần', 'Hàng tuần - 3 buổi/tuần'],
      fields: [
        sel('officeSize', 'Diện tích văn phòng', [
          opt('Dưới 80m²'),
          opt('80 - 150m²', { extraFee: 60000 }),
          opt('150 - 200m²', { extraFee: 120000 }),
          opt('Trên 200m²', { extraFee: 200000 }),
        ], { required: true }),
        sel('frequency', 'Tần suất', [
          opt('Một lần'),
          opt('Hàng tuần - 2 buổi/tuần', { extraFee: 50000 }),
          opt('Hàng tuần - 3 buổi/tuần', { extraFee: 100000 }),
        ], { required: true }),
        toggle('needSupplies', 'Cần mang máy hút bụi công nghiệp & hoá chất', 60000),
        toggle('afterHours', 'Dọn ngoài giờ hành chính (sau 18:00 hoặc cuối tuần)', 50000),
      ],
    },
    subtitle: 'Văn phòng sạch sẽ, nhân viên thoải mái',
    description: 'Nhóm vệ sinh làm việc theo checklist 20 hạng mục, có biên bản nghiệm thu sau mỗi buổi và hoá đơn VAT cho doanh nghiệp.',
    iconKey: 'Building2',
    themeClass: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    areas: ['Hà Nội', 'TP. Hồ Chí Minh'],
    bookingCount: 410,
    isPackage: false,
  },
  {
    id: 'SVC-010',
    serviceCode: SERVICE_CODES.CLEANING_PACKAGE,
    title: 'Giúp việc định kỳ - Gói tiết kiệm',
    shortDescription: 'Gói 4 - 12 buổi/tháng với người giúp việc cố định, tiết kiệm đến 20% so với đặt theo giờ, đổi người miễn phí.',
    category: 'Dọn dẹp',
    imageUrl: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=800&q=70',
    rating: 4.9,
    reviewCount: 512,
    pricing: {
      type: PRICING_TYPES.PACKAGE,
      packagePrice: 1480000,
      pricePerHour: 123000,
      formattedPrice: 'Từ 1.480.000đ / gói 4 buổi (3 giờ/buổi)',
      minHours: 3,
      stepHours: [3, 4, 6],
      priceFrom: null,
      priceTo: null,
      sortPrice: 1480000,
    },
    tags: ['Người làm cố định', 'Đổi người miễn phí', 'Hợp đồng linh hoạt'],
    bookingFormConfig: {
      packageOptions: [
        'Gói 4 buổi/tháng (3 giờ/buổi)',
        'Gói 8 buổi/tháng (3 giờ/buổi)',
        'Gói 12 buổi/tháng (3 giờ/buổi)',
      ],
      allowFixedWorkerOption: true,
      fields: [
        sel('packageOption', 'Chọn gói định kỳ', [
          opt('Gói 4 buổi/tháng (3 giờ/buổi)', { basePriceOverride: 1480000 }),
          opt('Gói 8 buổi/tháng (3 giờ/buổi)', { basePriceOverride: 2760000 }),
          opt('Gói 12 buổi/tháng (3 giờ/buổi)', { basePriceOverride: 3960000 }),
        ], { required: true }),
        sel('areaOption', 'Diện tích nhà', M2_AREA_OPTIONS, { required: true }),
        toggle('fixedWorker', 'Giữ cố định một người giúp việc'),
        multi('priorities', 'Khu vực ưu tiên dọn kỹ', PRIORITY_OPTIONS),
        toggle('hasPet', 'Nhà có thú cưng (xử lý lông & khử mùi)', 30000),
      ],
    },
    subtitle: 'Tiết kiệm chi phí, cố định người làm',
    description: 'Hợp đồng theo tháng, thanh toán 1 lần và chia đều các buổi; người giúp việc quen việc, nắm rõ nhà nên mỗi buổi nhanh và đúng ý hơn.',
    iconKey: 'ShieldCheck',
    themeClass: 'bg-teal-50 text-teal-600 border-teal-100',
    areas: ['Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng'],
    bookingCount: 870,
    isPackage: true,
  },
];

/* ---------- Selectors ---------- */
export const getServiceById = (id) => {
  if (!id) return null;
  const normalized = String(id).toLowerCase().trim();
  return (
    mockServices.find(
      (s) =>
        s.id.toLowerCase() === normalized ||
        s.serviceCode?.toLowerCase() === normalized
    ) || null
  );
};

export const getServiceByCode = (code) => mockServices.find((s) => s.serviceCode === code) || null;

/* Tìm dịch vụ từ dữ liệu mở modal / trang đặt lịch (Home/Hero/Featured helpers truyền vào) */
export const resolveService = (initialData = {}) => {
  const targetId = initialData.serviceId || initialData.id;
  if (targetId) {
    const byId = getServiceById(targetId);
    if (byId) return byId;
  }
  const keyword = (initialData.service || initialData.serviceTitle || '').trim().toLowerCase();
  if (keyword) {
    const exact = mockServices.find((s) => s.title.toLowerCase() === keyword);
    if (exact) return exact;
    const partial = mockServices.find(
      (s) => s.title.toLowerCase().includes(keyword) || keyword.includes(s.title.toLowerCase())
    );
    if (partial) return partial;
    const byTag = mockServices.find((s) =>
      s.tags.some((tag) => tag.toLowerCase().includes(keyword) || keyword.includes(tag.toLowerCase()))
    );
    if (byTag) return byTag;
  }
  return mockServices[0];
};

/* ---------- Giá trị mặc định cho các trường động của từng dịch vụ ---------- */
export const buildDefaultDynamicAttributes = (service) => {
  const config = service?.bookingFormConfig || {};
  const values = {};

  (config.fields || []).forEach((field) => {
    if (field.type === 'multi') {
      values[field.key] = field.required && field.options.length
        ? [field.options[0].value]
        : [];
    } else if (field.type === 'select') {
      values[field.key] = field.required && field.options.length ? field.options[0].value : '';
    } else if (field.type === 'toggle') {
      values[field.key] = false;
    } else if (field.type === 'number') {
      values[field.key] = field.min || 1;
    }
  });

  return values;
};

/* ---------- Tính giá ----------
 * Quy ước:
 * - HOURLY:      basePrice = durationHours × pricePerHour
 * - FIXED_SQM:   basePrice = diện tích (m²) × pricePerSqm
 * - PACKAGE:     basePrice = packagePrice × số thiết bị (role 'units'), hoặc
 *                ghi đè bằng option.basePriceOverride của trường động (ví dụ chọn gói).
 * - extraFee:    tổng phụ phí của các lựa chọn động (toggle / multi / select / number),
 *                bao gồm cả tiền tạm ứng (advance) như tạm ứng đi chợ.
 */
export const computePricing = (service, { durationHours, dynamicAttributes = {} } = {}) => {
  const pricing = service?.pricing || {};
  const fields = service?.bookingFormConfig?.fields || [];
  const hours = Math.max(Number(durationHours) || pricing.minHours || 2, pricing.minHours || 1);

  let basePrice = hours * (pricing.pricePerHour || 0);
  let basePriceLabel = `${hours} giờ × ${formatVND(pricing.pricePerHour || 0)}/giờ`;
  let units = 1;
  let areaSqm = null;
  const extraItems = [];

  /* Đơn giá theo loại hình dịch vụ */
  if (pricing.type === PRICING_TYPES.FIXED_SQM || pricing.type === PRICING_TYPES.PACKAGE) {
    const areaField = fields.find((f) => f.options && f.options.some((o) => o.sqm));
    if (areaField) {
      const areaOption = areaField.options.find((o) => o.value === dynamicAttributes[areaField.key]);
      if (areaOption?.sqm) areaSqm = areaOption.sqm;
    }
    if (areaSqm && pricing.pricePerSqm) {
      basePrice = areaSqm * pricing.pricePerSqm;
      basePriceLabel = `${areaSqm}m² × ${formatVND(pricing.pricePerSqm)}/m²`;
    } else if (pricing.type === PRICING_TYPES.PACKAGE && pricing.packagePrice) {
      const unitField = fields.find((f) => f.role === 'units');
      units = Math.max(1, Number(dynamicAttributes[unitField?.key]) || 1);
      basePrice = pricing.packagePrice * units;
      basePriceLabel = `${units} × ${formatVND(pricing.packagePrice)}/thiết bị (tối thiểu ${hours} giờ)`;
    }
  }

  /* Ghi đè basePrice bằng option được chọn (dùng cho gói dịch vụ) */
  fields.forEach((field) => {
    if (field.type !== 'select' || !field.options) return;
    const chosen = field.options.find((o) => o.value === dynamicAttributes[field.key]);
    if (chosen?.basePriceOverride) {
      basePrice = chosen.basePriceOverride;
      basePriceLabel = chosen.label;
      extraItems.push({ label: chosen.label, amount: 0, type: 'base' });
    }
  });

  /* Phụ phí theo lựa chọn động */
  fields.forEach((field) => {
    // Nếu trường này phụ thuộc vào 1 toggle mà toggle đó đang tắt -> bỏ qua
    if (field.hideWhen && !dynamicAttributes[field.hideWhen]) {
      return;
    }

    const value = dynamicAttributes[field.key];

    if (field.type === 'toggle') {
      if (value && field.extraFee) {
        extraItems.push({ label: field.label, amount: field.extraFee, type: 'fee' });
      }
      return;
    }

    if (field.type === 'number') {
      if (field.role === 'units') return; // đã nhân vào basePrice
      const quantity = Math.max(0, Number(value) - (field.freeUnits || 0));
      if (quantity > 0 && field.unitPrice) {
        extraItems.push({
          label: `${field.label} × ${quantity}`,
          amount: quantity * field.unitPrice,
          type: 'fee',
        });
      }
      return;
    }

    if (field.type === 'select' || field.type === 'multi') {
      const selected = Array.isArray(value) ? value : value ? [value] : [];
      selected.forEach((val) => {
        const option = (field.options || []).find((o) => o.value === val);
        if (option?.extraFee) {
          extraItems.push({
            label: option.advance ? 'Tạm ứng tiền đi chợ (hoàn lại phần chưa dùng)' : option.label,
            amount: option.extraFee,
            type: option.advance ? 'advance' : 'fee',
          });
        }
      });
    }
  });

  const extraFee = extraItems.reduce((sum, item) => sum + (item.amount || 0), 0);

  return {
    durationHours: hours,
    basePrice,
    basePriceLabel,
    extraFee,
    extraItems,
    otherFees: extraItems.filter((i) => i.type !== 'advance').reduce((s, i) => s + i.amount, 0),
    advanceFee: extraItems.filter((i) => i.type === 'advance').reduce((s, i) => s + i.amount, 0),
    units,
    areaSqm,
    totalPrice: basePrice + extraFee,
  };
};

/* ---------- Tóm tắt lựa chọn thành chuỗi để lưu vào đơn ---------- */
export const summarizeDynamicAttributes = (service, dynamicAttributes = {}) =>
  (service?.bookingFormConfig?.fields || [])
    .map((field) => {
      if (field.hideWhen && !dynamicAttributes[field.hideWhen]) return null;
      const value = dynamicAttributes[field.key];
      if (field.type === 'toggle') return value ? field.label : null;
      if (field.type === 'number') {
        const numVal = Number(value);
        return numVal > 0 ? `${field.label}: ${numVal}` : null;
      }
      if (field.type === 'multi') return Array.isArray(value) && value.length ? `${field.label}: ${value.join(', ')}` : null;
      return value ? `${field.label}: ${value}` : null;
    })
    .filter(Boolean)
    .join(' • ');