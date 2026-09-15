CREATE TABLE IF NOT EXISTS category_type_mst (
    id                       BIGINT       NOT NULL AUTO_INCREMENT,
    category_type_name       VARCHAR(100) NOT NULL,
    category_type_description VARCHAR(255),
    status                   VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
    created_at               DATETIME     DEFAULT CURRENT_TIMESTAMP,
    updated_at               DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_category_type_name (category_type_name)
);

CREATE TABLE IF NOT EXISTS category_detail (
    id                      BIGINT       NOT NULL AUTO_INCREMENT,
    category_type_id        BIGINT       NOT NULL,
    category_name           VARCHAR(100) NOT NULL,
    category_description    VARCHAR(255),
    image_url               VARCHAR(500),
    category_display_order  INT          NOT NULL DEFAULT 0,
    status                  VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
    created_at              DATETIME     DEFAULT CURRENT_TIMESTAMP,
    updated_at              DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_category_detail_type FOREIGN KEY (category_type_id) REFERENCES category_type_mst(id)
);

-- INSERT IGNORE INTO category_type_mst (id, category_type_name, category_type_description, status) VALUES
-- (1, 'navbar',             'Top navigation bar categories',  'ACTIVE'),
-- (2, 'only_in_surat',      'Products exclusive to Surat',    'ACTIVE'),
-- (3, 'best_selling',       'Best selling products section',  'ACTIVE'),
-- (4, 'shop_by_occasion',   'Shop by occasion section',       'ACTIVE'),
-- (5, 'shop_by_recipient',  'Shop by recipient section',      'ACTIVE');
--
-- -- navbar categories
-- INSERT IGNORE INTO category_detail (category_type_id, category_name, category_description, category_display_order, status) VALUES
-- (1, 'Blooms',      'Fresh roses, lilies, orchids and seasonal blooms',        1,  'ACTIVE'),
-- (1, 'Cakes',       'Custom floral cakes and flower-topped desserts',          2,  'ACTIVE'),
-- (1, 'Bouquets',    'Flower bouquets paired with cakes or chocolates',         3,  'ACTIVE'),
-- (1, 'Birthday',    'Bright birthday bouquets and floral arrangements',        4,  'ACTIVE'),
-- (1, 'Roses',       'Romantic roses and premium anniversary bouquets',         5,  'ACTIVE'),
-- (1, 'Hampers',     'Flower baskets, vases and curated floral gift sets',      6,  'ACTIVE'),
-- (1, 'Custom',      'Custom bouquets with personalised message cards',         7,  'ACTIVE'),
-- (1, 'Greens',      'Potted flowering plants and indoor green plants',         8,  'ACTIVE'),
-- (1, 'Chocolates',  'Chocolate boxes bundled with fresh flower bouquets',      9,  'ACTIVE'),
-- (1, 'Seasonal',    'Seasonal and festive floral arrangements',                10, 'ACTIVE'),
-- (1, 'Worldwide',   'Same-day flower delivery across international cities',    11, 'ACTIVE');
--
-- -- navbar categories
-- INSERT IGNORE INTO category_detail (category_type_id, category_name, category_description, category_display_order, status) VALUES
-- (2, 'Flowers',      'Fresh handpicked blooms delivered to your door',    1, 'ACTIVE'),
-- (2, 'Cakes',        'Delicious custom cakes for every celebration',      2, 'ACTIVE'),
-- (2, 'Combos',       'Perfect gift combos for your special ones',         3, 'ACTIVE'),
-- (2, 'Birthday',     'Make every birthday unforgettable',                 4, 'ACTIVE'),
-- (2, 'Anniversary',  'Celebrate love with timeless arrangements',         5, 'ACTIVE'),
-- (2, 'Plants',       'Bring nature indoors with our plant collection',    6, 'ACTIVE'),
-- (2, 'Chocolates',   'Premium chocolates for the sweetest moments',       7, 'ACTIVE'),
-- (2, 'Personalised', 'Custom creations made just for them',               8, 'ACTIVE');
--
-- -- best_selling categories
-- INSERT IGNORE INTO category_detail (category_type_id, category_name, category_description, category_display_order, status) VALUES
-- (3, 'Best Selling Flowers',          'Top selling fresh flowers and gifts',      1, 'ACTIVE'),
-- (3, 'Best Selling Artificial Items', 'Top selling artificial flowers and decor', 2, 'ACTIVE');
--
-- -- shop_by_occasion categories
-- INSERT IGNORE INTO category_detail (category_type_id, category_name, category_description, category_display_order, status) VALUES
-- (4, 'Birthday',        'Celebrate birthdays with flowers and cakes',       1,  'ACTIVE'),
-- (4, 'Anniversary',     'Mark anniversaries with romantic arrangements',    2,  'ACTIVE'),
-- (4, 'New Baby',        'Welcome a new baby with fresh blooms',             3,  'ACTIVE'),
-- (4, 'My Love',            'Express love with beautiful flowers',              4,  'ACTIVE'),
-- (4, 'I am Sorry',      'Apologise with a heartfelt floral gesture',       5,  'ACTIVE'),
-- (4, 'Get Well Soon',   'Brighten someones day with cheerful flowers',     6,  'ACTIVE'),
-- (4, 'Corporate',       'Professional floral arrangements for offices',    7,  'ACTIVE'),
-- (4, 'Sympathy',        'Offer condolences with graceful arrangements',    8,  'ACTIVE'),
-- (4, 'Congratulations', 'Celebrate achievements with vibrant blooms',      9,  'ACTIVE'),
-- (4, 'Thank You',       'Show gratitude with a beautiful bouquet',         10, 'ACTIVE');
--
-- -- shop_by_recipient categories
-- INSERT IGNORE INTO category_detail (category_type_id, category_name, category_description, category_display_order, status) VALUES
-- (5, 'Her',          'Flowers and gifts for her',                   1, 'ACTIVE'),
-- (5, 'Him',          'Flowers and gifts for him',                   2, 'ACTIVE'),
-- (5, 'Mom',          'Special flowers and gifts for mom',           3, 'ACTIVE'),
-- (5, 'Dad',          'Thoughtful gifts and flowers for dad',        4, 'ACTIVE'),
-- (5, 'Bestest Friends', 'Fun and cheerful gifts for best friends',  5, 'ACTIVE'),
-- (5, 'Grandparents', 'Warm and loving gifts for grandparents',      6, 'ACTIVE'),
-- (5, 'Boss',         'Professional and elegant gifts for your boss',7, 'ACTIVE'),
-- (5, 'Colleagues',   'Friendly gifts and flowers for colleagues',   8, 'ACTIVE');

CREATE TABLE IF NOT EXISTS product_detail (
    id                   BIGINT          NOT NULL AUTO_INCREMENT,
    name                 VARCHAR(255)    NOT NULL,
    description          TEXT,
    contains             TEXT,
    price                DECIMAL(10,2)   NOT NULL,
    original_price       DECIMAL(10,2)   NOT NULL,
    stock                INT             NOT NULL DEFAULT 0,
    rating               DECIMAL(2,1)    NOT NULL DEFAULT 0.0,
    review_count         INT             NOT NULL DEFAULT 0,
    tag                  VARCHAR(50),
    image_url            VARCHAR(500),
    image_url2           VARCHAR(500),
    image_url3           VARCHAR(500),
    image_url4           VARCHAR(500),
    image_url5           VARCHAR(500),
    delivery             VARCHAR(100)    DEFAULT 'Tomorrow',
    highlight1           VARCHAR(100),
    highlight2           VARCHAR(100),
    highlight3           VARCHAR(100),
    highlight4           VARCHAR(100),
    available            BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at           DATETIME        DEFAULT CURRENT_TIMESTAMP,
    updated_at           DATETIME        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_pd_available (available)
);

CREATE TABLE IF NOT EXISTS product_category_mapping (
    id                  BIGINT NOT NULL AUTO_INCREMENT,
    product_id          BIGINT NOT NULL,
    category_id         BIGINT NOT NULL,
    created_at          DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_product_category (product_id, category_id),
    CONSTRAINT fk_pcm_product  FOREIGN KEY (product_id)  REFERENCES product_detail(id),
    CONSTRAINT fk_pcm_category FOREIGN KEY (category_id) REFERENCES category_detail(id)
);

CREATE TABLE IF NOT EXISTS users (
    id                  BIGINT       NOT NULL AUTO_INCREMENT,
    firebase_uid        VARCHAR(255),
    name                VARCHAR(255) NOT NULL,
    title               VARCHAR(255),
    gender              VARCHAR(255),
    date_of_birth       VARCHAR(255),
    mobile_number       VARCHAR(255),
    email               VARCHAR(255),
    role                VARCHAR(50)  NOT NULL DEFAULT 'CUSTOMER',
    status              VARCHAR(50)  NOT NULL DEFAULT 'ACTIVE',
    is_mobile_verified  BOOLEAN      NOT NULL DEFAULT TRUE,
    is_email_verified   BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at          DATETIME,
    updated_at          DATETIME,
    PRIMARY KEY (id),
    UNIQUE KEY uk_firebase_uid  (firebase_uid),
    UNIQUE KEY uk_mobile_number (mobile_number),
    UNIQUE KEY uk_email         (email),
    INDEX idx_user_mobile (mobile_number),
    INDEX idx_user_email  (email),
    INDEX idx_user_name   (name),
    INDEX idx_user_status (status),
    INDEX idx_user_role   (role)
);

CREATE TABLE IF NOT EXISTS user_addresses (
    id              BIGINT       NOT NULL AUTO_INCREMENT,
    user_id         BIGINT       NOT NULL,
    full_name       VARCHAR(150) NOT NULL,
    mobile_number   VARCHAR(15)  NOT NULL,
    address1        VARCHAR(255) NOT NULL,
    address2        VARCHAR(255),
    city            VARCHAR(100) NOT NULL,
    state           VARCHAR(100) NOT NULL,
    pincode         VARCHAR(10)  NOT NULL,
    country         VARCHAR(100) NOT NULL DEFAULT 'India',
    address_type    VARCHAR(20)  NOT NULL DEFAULT 'HOME',
    is_default      BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at      DATETIME,
    updated_at      DATETIME,
    PRIMARY KEY (id),
    CONSTRAINT fk_ua_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_ua_user_id (user_id),
    INDEX idx_ua_default (is_default)
);

CREATE TABLE IF NOT EXISTS carts (
    id          BIGINT   NOT NULL AUTO_INCREMENT,
    user_id     BIGINT   NOT NULL,
    status      VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_cart_user (user_id),
    CONSTRAINT fk_cart_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS cart_items (
    id          BIGINT NOT NULL AUTO_INCREMENT,
    cart_id     BIGINT NOT NULL,
    product_id  BIGINT NOT NULL,
    quantity    INT    NOT NULL DEFAULT 1,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_cart_product (cart_id, product_id),
    CONSTRAINT fk_ci_cart    FOREIGN KEY (cart_id)    REFERENCES carts(id) ON DELETE CASCADE,
    CONSTRAINT fk_ci_product FOREIGN KEY (product_id) REFERENCES product_detail(id)
);

CREATE TABLE IF NOT EXISTS guest_carts (
    id             BIGINT       NOT NULL AUTO_INCREMENT,
    session_token  VARCHAR(64)  NOT NULL,
    created_at     DATETIME     DEFAULT CURRENT_TIMESTAMP,
    updated_at     DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    expires_at     DATETIME     NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_guest_session (session_token),
    INDEX idx_gc_expires (expires_at)
);

CREATE TABLE IF NOT EXISTS guest_cart_items (
    id             BIGINT NOT NULL AUTO_INCREMENT,
    guest_cart_id  BIGINT NOT NULL,
    product_id     BIGINT NOT NULL,
    quantity       INT    NOT NULL DEFAULT 1,
    created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at     DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_guest_cart_product (guest_cart_id, product_id),
    CONSTRAINT fk_gci_cart    FOREIGN KEY (guest_cart_id) REFERENCES guest_carts(id) ON DELETE CASCADE,
    CONSTRAINT fk_gci_product FOREIGN KEY (product_id)    REFERENCES product_detail(id)
);

-- ============================================================
-- ORDERS
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
    id                  BIGINT          NOT NULL AUTO_INCREMENT,
    order_number        VARCHAR(20)     NOT NULL,
    idempotency_key     VARCHAR(64),
    user_id             BIGINT          NOT NULL,
    address_id          BIGINT,
    status              VARCHAR(30)     NOT NULL DEFAULT 'CONFIRMED',
    total_amount        DECIMAL(10,2)   NOT NULL,
    created_at          DATETIME        DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_order_number      (order_number),
    UNIQUE KEY uk_idempotency_key   (idempotency_key),
    CONSTRAINT fk_order_user    FOREIGN KEY (user_id)    REFERENCES users(id),
    CONSTRAINT fk_order_address FOREIGN KEY (address_id) REFERENCES user_addresses(id),
    INDEX idx_order_user    (user_id),
    INDEX idx_order_status  (status),
    INDEX idx_order_created (created_at)
);

-- ============================================================
-- ORDER ITEMS  (snapshot of product at purchase time)
-- ============================================================
CREATE TABLE IF NOT EXISTS order_items (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    order_id        BIGINT          NOT NULL,
    product_id      BIGINT          NOT NULL,
    product_name    VARCHAR(255)    NOT NULL,
    quantity        INT             NOT NULL,
    unit_price      DECIMAL(10,2)   NOT NULL,
    original_price  DECIMAL(10,2)   NOT NULL,
    subtotal        DECIMAL(10,2)   NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_oi_order   FOREIGN KEY (order_id)   REFERENCES orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_oi_product FOREIGN KEY (product_id) REFERENCES product_detail(id),
    INDEX idx_oi_order (order_id)
);

-- ============================================================
-- ORDER STATUS HISTORY
-- ============================================================
CREATE TABLE IF NOT EXISTS order_status_history (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    order_id        BIGINT          NOT NULL,
    from_status     VARCHAR(30),
    to_status       VARCHAR(30)     NOT NULL,
    changed_by      VARCHAR(255),
    reason          VARCHAR(500),
    created_at      DATETIME        DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_osh_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    INDEX idx_osh_order (order_id)
);

-- ============================================================
-- GALLERY ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS gallery_items (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    name            VARCHAR(255)    NOT NULL,
    description     VARCHAR(500),
    category        VARCHAR(100)    NOT NULL,
    image_url       VARCHAR(500),
    display_order   INT             NOT NULL DEFAULT 0,
    status          VARCHAR(20)     NOT NULL DEFAULT 'ACTIVE',
    created_at      DATETIME        DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_gi_category (category),
    INDEX idx_gi_status   (status)
);

-- ============================================================
-- INVENTORY TRANSACTIONS  (audit log for stock changes)
-- ============================================================
CREATE TABLE IF NOT EXISTS inventory_transactions (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    product_id      BIGINT          NOT NULL,
    transaction_type VARCHAR(20)    NOT NULL,
    quantity_change INT             NOT NULL,
    stock_before    INT             NOT NULL,
    stock_after     INT             NOT NULL,
    reference_id    BIGINT,
    reference_type  VARCHAR(30),
    notes           VARCHAR(500),
    created_by      VARCHAR(255),
    created_at      DATETIME        DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_it_product FOREIGN KEY (product_id) REFERENCES product_detail(id),
    INDEX idx_it_product (product_id),
    INDEX idx_it_type    (transaction_type),
    INDEX idx_it_created (created_at)
);
