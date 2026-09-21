package com.sellara.service;

import com.sellara.entity.*;
import com.sellara.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class DataInitializerService implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializerService.class);

    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializerService(CategoryRepository categoryRepository,
                                  UserRepository userRepository,
                                  ProductRepository productRepository,
                                  PasswordEncoder passwordEncoder) {
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        try {
            initCategories();
            initUsersAndProducts();
            logger.info("Sellara database initialization completed successfully.");
        } catch (Exception e) {
            logger.error("Error during database initialization: {}", e.getMessage());
        }
    }

    private void initCategories() {
        if (categoryRepository.count() == 0) {
            List<Category> categories = List.of(
                new Category("Mobiles & Tablets", "mobiles", "Smartphone", "Smartphones, tablets, and mobile accessories"),
                new Category("Electronics & Laptops", "electronics", "Laptop", "Computers, audio gear, cameras, and gaming consoles"),
                new Category("Vehicles", "vehicles", "Car", "Bikes, scooters, cars, and automotive accessories"),
                new Category("Furniture", "furniture", "Armchair", "Home and office furniture in great condition"),
                new Category("Fashion & Apparel", "fashion", "Shirt", "Designer clothing, watches, bags, and shoes"),
                new Category("Books & Hobbies", "books", "BookOpen", "Rare books, textbooks, musical instruments, and games"),
                new Category("Home Appliances", "appliances", "Tv", "Kitchen appliances, TVs, air conditioners, and vacuums")
            );
            categoryRepository.saveAll(categories);
            logger.info("Initialized {} categories", categories.size());
        }
    }

    private void initUsersAndProducts() {
        if (userRepository.count() == 0) {
            // Create Demo Seller
            User seller = new User(
                "seller@sellara.com",
                passwordEncoder.encode("Sellara@123"),
                "Alex Rivera",
                "+91 98765 01990",
                "Hyderabad, Telangana",
                Role.ROLE_SELLER
            );
            User savedSeller = userRepository.save(seller);

            // Create Demo Buyer
            User buyer = new User(
                "buyer@sellara.com",
                passwordEncoder.encode("Sellara@123"),
                "Sarah Chen",
                "+91 98765 01440",
                "Bengaluru, Karnataka",
                Role.ROLE_BUYER
            );
            userRepository.save(buyer);

            Category mobiles = categoryRepository.findBySlug("mobiles").orElse(null);
            Category electronics = categoryRepository.findBySlug("electronics").orElse(null);
            Category vehicles = categoryRepository.findBySlug("vehicles").orElse(null);
            Category furniture = categoryRepository.findBySlug("furniture").orElse(null);
            Category fashion = categoryRepository.findBySlug("fashion").orElse(null);
            Category books = categoryRepository.findBySlug("books").orElse(null);

            if (mobiles != null && electronics != null && vehicles != null && furniture != null) {
                List<Product> products = List.of(
                    new Product(
                        "iPhone 14 Pro - 256GB Deep Purple (Unlocked)",
                        "Flawless condition iPhone 14 Pro in stunning Deep Purple. Battery health is at 94%. Comes with original Indian retail bill, box, unused Braided Type-C to Lightning cable, and a Spigen armor case.",
                        mobiles,
                        Condition.LIKE_NEW,
                        BigDecimal.valueOf(64999.00),
                        BigDecimal.valueOf(109900.00),
                        "https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=800&auto=format&fit=crop&q=80",
                        "Hyderabad, Telangana",
                        "Telangana",
                        "Hyderabad",
                        "Hyderabad",
                        "500081",
                        savedSeller
                    ),
                    new Product(
                        "Sony WH-1000XM5 Wireless Noise-Canceling Headphones",
                        "Silver colorway. Industry-leading active noise cancelation, 30-hour battery life. Used occasionally for work flights. Includes original carrying case, 3.5mm gold-plated cable, and USB-C charger.",
                        electronics,
                        Condition.EXCELLENT,
                        BigDecimal.valueOf(21999.00),
                        BigDecimal.valueOf(34990.00),
                        "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80",
                        "Bengaluru, Karnataka",
                        "Karnataka",
                        "Bengaluru Urban",
                        "Bengaluru",
                        "560001",
                        savedSeller
                    ),
                    new Product(
                        "Apple MacBook Air 13\" M2 (16GB RAM, 512GB SSD) - Space Gray",
                        "Custom 16GB unified memory model. Ideal for software development and design. Only 44 battery cycles, 98% health. Screen and aluminum unibody in pristine condition with MagSafe 3 cable and 35W dual power adapter.",
                        electronics,
                        Condition.LIKE_NEW,
                        BigDecimal.valueOf(78500.00),
                        BigDecimal.valueOf(114900.00),
                        "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80",
                        "Pune, Maharashtra",
                        "Maharashtra",
                        "Pune",
                        "Pune",
                        "411001",
                        savedSeller
                    ),
                    new Product(
                        "Herman Miller Aeron Ergonomic Chair (Size B, Fully Loaded)",
                        "Original Herman Miller Aeron with PostureFit SL lumbar support, fully adjustable arms, and forward tilt limiter. Upgraded soft roller casters safe for wooden and tiled flooring.",
                        furniture,
                        Condition.EXCELLENT,
                        BigDecimal.valueOf(48000.00),
                        BigDecimal.valueOf(115000.00),
                        "https://images.unsplash.com/photo-1580481077154-aa6222b405f6?w=800&auto=format&fit=crop&q=80",
                        "Mumbai, Maharashtra",
                        "Maharashtra",
                        "Mumbai Suburban",
                        "Mumbai",
                        "400050",
                        savedSeller
                    ),
                    new Product(
                        "Fujifilm X-T4 Mirrorless Digital Camera with 18-55mm OIS Lens",
                        "Shutter count below 6,200. Classic Fuji film simulation profiles, in-body 5-axis image stabilization (IBIS), and 4K 60fps video capability. Includes 2 original Fuji batteries, dual charger, strap, and 64GB Extreme Pro SD card.",
                        electronics,
                        Condition.GOOD,
                        BigDecimal.valueOf(95000.00),
                        BigDecimal.valueOf(149999.00),
                        "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80",
                        "New Delhi, Delhi NCR",
                        "Delhi NCR",
                        "Central Delhi",
                        "New Delhi",
                        "110001",
                        savedSeller
                    ),
                    new Product(
                        "Trek Dual Sport 3 Hybrid Commuter Bike (Large Frame)",
                        "Lightweight Alpha Gold Aluminum frame with front suspension lockout, Shimano hydraulic disc brakes, and tubeless-ready puncture-resistant tires. Recently serviced with new Shimano chain.",
                        vehicles,
                        Condition.GOOD,
                        BigDecimal.valueOf(38000.00),
                        BigDecimal.valueOf(72000.00),
                        "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&auto=format&fit=crop&q=80",
                        "Chennai, Tamil Nadu",
                        "Tamil Nadu",
                        "Chennai",
                        "Chennai",
                        "600001",
                        savedSeller
                    ),
                    new Product(
                        "Vintage Schott NYC Steerhide Leather Motorcycle Jacket (Size 40)",
                        "Classic American heavyweight steerhide leather jacket. Beautiful natural patina developed with care. Heavy-duty brass Talon zippers, quilted thermal lining in great shape.",
                        fashion != null ? fashion : electronics,
                        Condition.EXCELLENT,
                        BigDecimal.valueOf(12500.00),
                        BigDecimal.valueOf(28000.00),
                        "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop&q=80",
                        "Jaipur, Rajasthan",
                        "Rajasthan",
                        "Jaipur",
                        "Jaipur",
                        "302001",
                        savedSeller
                    ),
                    new Product(
                        "Fender Player Stratocaster Electric Guitar - Polar White",
                        "Classic Fender chime with trio of Player Series single-coil pickups, modern C maple neck, and 2-point tremolo bridge. Professionally set up with low action and fresh 10-46 strings. Padded gig bag included.",
                        books != null ? books : electronics,
                        Condition.LIKE_NEW,
                        BigDecimal.valueOf(44000.00),
                        BigDecimal.valueOf(69999.00),
                        "https://images.unsplash.com/photo-1550291652-6ea9114a47b1?w=800&auto=format&fit=crop&q=80",
                        "Kolkata, West Bengal",
                        "West Bengal",
                        "Kolkata",
                        "Kolkata",
                        "700001",
                        savedSeller
                    )
                );
                productRepository.saveAll(products);
                logger.info("Initialized {} realistic Indian demo marketplace products in INR", products.size());
            }
        }
    }
}