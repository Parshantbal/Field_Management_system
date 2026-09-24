package com.keystone.data;

import com.keystone.model.*;
import com.keystone.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final FacilityRepository facilityRepository;
    private final AssetRepository assetRepository;
    private final TechnicianRepository technicianRepository;
    private final PartRepository partRepository;
    private final WorkOrderRepository workOrderRepository;
    private final WorkOrderPartRepository workOrderPartRepository;
    private final TimeEntryRepository timeEntryRepository;
    private final AuditLogRepository auditLogRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(
            UserRepository userRepository,
            FacilityRepository facilityRepository,
            AssetRepository assetRepository,
            TechnicianRepository technicianRepository,
            PartRepository partRepository,
            WorkOrderRepository workOrderRepository,
            WorkOrderPartRepository workOrderPartRepository,
            TimeEntryRepository timeEntryRepository,
            AuditLogRepository auditLogRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.facilityRepository = facilityRepository;
        this.assetRepository = assetRepository;
        this.technicianRepository = technicianRepository;
        this.partRepository = partRepository;
        this.workOrderRepository = workOrderRepository;
        this.workOrderPartRepository = workOrderPartRepository;
        this.timeEntryRepository = timeEntryRepository;
        this.auditLogRepository = auditLogRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("Database already initialized with data. Skipping seed.");
            return;
        }

        log.info("Initializing Project KEYSTONE enterprise demo dataset...");

        // 1. Users
        String encodedPass = passwordEncoder.encode("password123");

        User admin = userRepository.save(User.builder()
                .email("admin@keystone.io")
                .passwordHash(encodedPass)
                .firstName("Elena")
                .lastName("Rostova")
                .role(Role.ROLE_ADMIN)
                .phone("+1 (555) 019-2831")
                .adminId(1L)
                .active(true)
                .build());

        User dispatcher = userRepository.save(User.builder()
                .email("dispatcher@keystone.io")
                .passwordHash(encodedPass)
                .firstName("Marcus")
                .lastName("Vance")
                .role(Role.ROLE_DISPATCHER)
                .phone("+1 (555) 019-4820")
                .adminId(1L)
                .active(true)
                .build());

        User techUser1 = userRepository.save(User.builder()
                .email("tech.davis@keystone.io")
                .passwordHash(encodedPass)
                .firstName("Julian")
                .lastName("Davis")
                .role(Role.ROLE_TECHNICIAN)
                .phone("+1 (555) 019-9112")
                .adminId(1L)
                .active(true)
                .build());

        User techUser2 = userRepository.save(User.builder()
                .email("tech.chen@keystone.io")
                .passwordHash(encodedPass)
                .firstName("Sarah")
                .lastName("Chen")
                .role(Role.ROLE_TECHNICIAN)
                .phone("+1 (555) 019-7334")
                .adminId(1L)
                .active(true)
                .build());

        User clientApex = userRepository.save(User.builder()
                .email("client.apex@keystone.io")
                .passwordHash(encodedPass)
                .firstName("David")
                .lastName("Miller")
                .role(Role.ROLE_CUSTOMER)
                .phone("+1 (555) 019-5561")
                .adminId(1L)
                .active(true)
                .build());

        // 2. Technicians
        Technician tech1 = technicianRepository.save(Technician.builder()
                .user(techUser1)
                .specialization("HVAC & Climate Control Systems")
                .certifications("EPA Universal, NATE Commercial Certified, ASHRAE Member")
                .hourlyRate(new BigDecimal("85.00"))
                .status("ON_JOB")
                .currentLatitude(40.7128)
                .currentLongitude(-74.0060)
                .rating(new BigDecimal("4.92"))
                .activeJobsCount(1)
                .adminId(1L)
                .build());

        Technician tech2 = technicianRepository.save(Technician.builder()
                .user(techUser2)
                .specialization("High Voltage & Industrial Electrical")
                .certifications("Master Electrician, OSHA 30, NFPA 70E Arc Flash")
                .hourlyRate(new BigDecimal("95.00"))
                .status("AVAILABLE")
                .currentLatitude(40.7306)
                .currentLongitude(-73.9352)
                .rating(new BigDecimal("4.98"))
                .activeJobsCount(0)
                .adminId(1L)
                .build());

        // 3. Facilities
        Facility apexTower = facilityRepository.save(Facility.builder()
                .name("Apex Tower Commercial Complex")
                .code("FAC-APEX-01")
                .addressLine("750 Avenue of the Americas")
                .city("New York")
                .state("NY")
                .postalCode("10001")
                .contactPerson("David Miller")
                .contactPhone("+1 (555) 019-5561")
                .totalSqFt(480000)
                .adminId(1L)
                .build());

        Facility metroHub = facilityRepository.save(Facility.builder()
                .name("Metro Logistics & Distribution Center")
                .code("FAC-METRO-02")
                .addressLine("1200 Logistics Parkway")
                .city("Secaucus")
                .state("NJ")
                .postalCode("07094")
                .contactPerson("Rachel Ward")
                .contactPhone("+1 (555) 019-8822")
                .totalSqFt(350000)
                .adminId(1L)
                .build());

        Facility horizonPavilion = facilityRepository.save(Facility.builder()
                .name("Horizon Life Sciences Pavilion")
                .code("FAC-HORIZON-03")
                .addressLine("450 Biotech Boulevard")
                .city("Cambridge")
                .state("MA")
                .postalCode("02142")
                .contactPerson("Dr. Aris Thorne")
                .contactPhone("+1 (555) 019-3349")
                .totalSqFt(110000)
                .adminId(1L)
                .build());

        // 4. Assets
        Asset chiller = assetRepository.save(Asset.builder()
                .facility(apexTower)
                .name("Centrifugal Chiller Unit #2")
                .tagNumber("HVAC-CH-002")
                .category("HVAC")
                .floor("Basement B2")
                .room("Mechanical Plant 01")
                .manufacturer("Carrier")
                .modelNumber("19XR-500TR")
                .serialNumber("CR-992019-B")
                .installDate(LocalDate.of(2021, 4, 15))
                .status("DEGRADED")
                .build());

        Asset switchgear = assetRepository.save(Asset.builder()
                .facility(apexTower)
                .name("Main Switchgear Panel 480V")
                .tagNumber("ELEC-SWG-001")
                .category("ELECTRICAL")
                .floor("Sub-Basement B3")
                .room("Vault E-1")
                .manufacturer("Schneider Electric")
                .modelNumber("Square D MasterPact")
                .serialNumber("SN-77341-E")
                .installDate(LocalDate.of(2020, 8, 10))
                .status("OPERATIONAL")
                .build());

        Asset generator = assetRepository.save(Asset.builder()
                .facility(metroHub)
                .name("Emergency Generator 750kVA")
                .tagNumber("ELEC-GEN-003")
                .category("ELECTRICAL")
                .floor("Ground Level")
                .room("Generator Enclosure North")
                .manufacturer("Cummins")
                .modelNumber("QSK23-G7")
                .serialNumber("CUM-558291")
                .installDate(LocalDate.of(2019, 11, 20))
                .status("OPERATIONAL")
                .build());

        Asset hvacRooftop = assetRepository.save(Asset.builder()
                .facility(horizonPavilion)
                .name("Cleanroom Precision Air Handler 4")
                .tagNumber("HVAC-AHU-004")
                .category("HVAC")
                .floor("Rooftop Mechanical")
                .room("Penthouse Room 2")
                .manufacturer("Trane")
                .modelNumber("IntelliPak 75")
                .serialNumber("TR-664420")
                .installDate(LocalDate.of(2022, 1, 12))
                .status("OPERATIONAL")
                .build());

        // 5. Parts Inventory
        Part partRefrigerant = partRepository.save(Part.builder()
                .partNumber("PART-REF-410A")
                .name("R-410A Refrigerant Cylinder 25lb")
                .description("Non-ozone depleting hydrofluorocarbon refrigerant for commercial chillers")
                .category("HVAC")
                .unitPrice(new BigDecimal("225.00"))
                .stockQuantity(14)
                .reorderLevel(5)
                .unitOfMeasure("CYLINDER")
                .build());

        Part partFilter = partRepository.save(Part.builder()
                .partNumber("PART-FLT-M13")
                .name("Industrial Air Filter MERV 13 (24x24x2)")
                .description("High efficiency pleated air filtration media for commercial air handlers")
                .category("HVAC")
                .unitPrice(new BigDecimal("34.50"))
                .stockQuantity(48)
                .reorderLevel(12)
                .unitOfMeasure("EACH")
                .build());

        Part partBreaker = partRepository.save(Part.builder()
                .partNumber("PART-BRK-30A3P")
                .name("30A 3-Pole Molded Case Circuit Breaker")
                .description("Square D thermal magnetic circuit breaker 480Y/277V")
                .category("ELECTRICAL")
                .unitPrice(new BigDecimal("145.00"))
                .stockQuantity(8)
                .reorderLevel(4)
                .unitOfMeasure("EACH")
                .build());

        Part partBelt = partRepository.save(Part.builder()
                .partNumber("PART-BLT-AX55")
                .name("Blower Cogged V-Belt AX-55")
                .description("Heavy duty heat resistant industrial drive belt")
                .category("HVAC")
                .unitPrice(new BigDecimal("28.00"))
                .stockQuantity(3)
                .reorderLevel(6)
                .unitOfMeasure("EACH")
                .build());

        Part partActuator = partRepository.save(Part.builder()
                .partNumber("PART-ACT-BLM24")
                .name("Belimo 24V Modulating Actuator Valve")
                .description("Proportional fail-safe spring return damper actuator")
                .category("HVAC")
                .unitPrice(new BigDecimal("310.00"))
                .stockQuantity(6)
                .reorderLevel(3)
                .unitOfMeasure("EACH")
                .build());

        // 6. Work Orders
        Instant now = Instant.now();

        // Work Order 1: CRITICAL
        WorkOrder wo1 = WorkOrder.builder()
                .workOrderNumber("WO-2026-00101")
                .title("Critical Refrigerant Leak on Centrifugal Chiller #2")
                .description("Main chiller pressure drop detected in Plant 01. High temperature alarm triggered on 15th-30th office zones. Immediate leak detection and charge required.")
                .priority(Priority.CRITICAL)
                .status(WorkOrderStatus.ON_SITE)
                .facility(apexTower)
                .asset(chiller)
                .customer(clientApex)
                .assignedTechnician(tech1)
                .scheduledStart(now.minus(2, ChronoUnit.HOURS))
                .scheduledEnd(now.plus(2, ChronoUnit.HOURS))
                .responseSlaDue(now.minus(1, ChronoUnit.HOURS))
                .resolutionSlaDue(now.plus(45, ChronoUnit.MINUTES))
                .respondedAt(now.minus(110, ChronoUnit.MINUTES))
                .adminId(1L)
                .build();
        wo1 = workOrderRepository.save(wo1);

        WorkOrderPart wo1Part = WorkOrderPart.builder()
                .workOrder(wo1)
                .part(partRefrigerant)
                .quantityUsed(1)
                .unitPriceAtUse(partRefrigerant.getUnitPrice())
                .totalCost(partRefrigerant.getUnitPrice())
                .build();
        workOrderPartRepository.save(wo1Part);

        TimeEntry wo1Travel = TimeEntry.builder()
                .workOrder(wo1)
                .technician(tech1)
                .entryType("TRAVEL")
                .startTime(now.minus(110, ChronoUnit.MINUTES))
                .endTime(now.minus(75, ChronoUnit.MINUTES))
                .durationMinutes(35L)
                .hourlyRate(tech1.getHourlyRate())
                .laborCost(new BigDecimal("49.58"))
                .notes("Dispatched via express transit to Apex Tower B2")
                .build();
        timeEntryRepository.save(wo1Travel);

        TimeEntry wo1OnSite = TimeEntry.builder()
                .workOrder(wo1)
                .technician(tech1)
                .entryType("ON_SITE")
                .startTime(now.minus(75, ChronoUnit.MINUTES))
                .endTime(null)
                .durationMinutes(75L)
                .hourlyRate(tech1.getHourlyRate())
                .laborCost(new BigDecimal("106.25"))
                .notes("Recovering refrigerant and sealing flare fitting on suction line")
                .build();
        timeEntryRepository.save(wo1OnSite);

        wo1.setPartsUsed(new java.util.ArrayList<>(java.util.List.of(wo1Part)));
        wo1.setTimeEntries(new java.util.ArrayList<>(java.util.List.of(wo1Travel, wo1OnSite)));
        wo1.recalculateTotals();
        workOrderRepository.save(wo1);

        auditLogRepository.save(AuditLog.builder()
                .workOrder(wo1)
                .performedBy(dispatcher)
                .action("DISPATCHED")
                .fromStatus(WorkOrderStatus.OPEN)
                .toStatus(WorkOrderStatus.ASSIGNED)
                .notes("Urgent dispatch assigned to Julian Davis")
                .timestamp(now.minus(115, ChronoUnit.MINUTES))
                .build());

        auditLogRepository.save(AuditLog.builder()
                .workOrder(wo1)
                .performedBy(techUser1)
                .action("STATUS_CHANGE")
                .fromStatus(WorkOrderStatus.EN_ROUTE)
                .toStatus(WorkOrderStatus.ON_SITE)
                .notes("Technician arrived at Mechanical Plant 01, isolating chiller")
                .timestamp(now.minus(75, ChronoUnit.MINUTES))
                .build());

        // Work Order 2: HIGH
        WorkOrder wo2 = WorkOrder.builder()
                .workOrderNumber("WO-2026-00102")
                .title("Switchgear Panel 480V Thermal Anomaly - Feeder Breaker 3")
                .description("Infrared thermography scan showed 78C on B-phase bus connection. Exceeds NFPA 70E safe threshold. Requires thermal tightening and torque verification.")
                .priority(Priority.HIGH)
                .status(WorkOrderStatus.TRIAGED)
                .facility(apexTower)
                .asset(switchgear)
                .customer(clientApex)
                .responseSlaDue(now.plus(2, ChronoUnit.HOURS))
                .resolutionSlaDue(now.plus(20, ChronoUnit.HOURS))
                .respondedAt(now.minus(30, ChronoUnit.MINUTES))
                .adminId(1L)
                .build();
        workOrderRepository.save(wo2);

        auditLogRepository.save(AuditLog.builder()
                .workOrder(wo2)
                .performedBy(dispatcher)
                .action("TRIAGED")
                .fromStatus(WorkOrderStatus.OPEN)
                .toStatus(WorkOrderStatus.TRIAGED)
                .notes("Verified thermography report with facility team. Ready for electrical dispatch.")
                .timestamp(now.minus(30, ChronoUnit.MINUTES))
                .build());

        // Work Order 3: COMPLETED
        WorkOrder wo3 = WorkOrder.builder()
                .workOrderNumber("WO-2026-00098")
                .title("Quarterly ATS Testing & Battery Cell Replacement on 750kVA Generator")
                .description("Mandatory NFPA 110 testing of automatic transfer switch, load bank verification, and replacement of degraded starter battery cells.")
                .priority(Priority.MEDIUM)
                .status(WorkOrderStatus.CLOSED)
                .facility(metroHub)
                .asset(generator)
                .customer(admin)
                .assignedTechnician(tech2)
                .scheduledStart(now.minus(24, ChronoUnit.HOURS))
                .scheduledEnd(now.minus(20, ChronoUnit.HOURS))
                .responseSlaDue(now.minus(20, ChronoUnit.HOURS))
                .resolutionSlaDue(now.minus(12, ChronoUnit.HOURS))
                .respondedAt(now.minus(23, ChronoUnit.HOURS))
                .resolvedAt(now.minus(19, ChronoUnit.HOURS))
                .resolutionNotes("Completed 30-minute load transfer test under 65% building load. Battery bank replaced and equalized. ATS firmware updated to v4.12. All parameters nominal.")
                .customerRating(5)
                .customerFeedback("Outstanding execution by Sarah Chen. Zero disruption to warehouse distribution operations during transfer test.")
                .totalLaborCost(new BigDecimal("380.00"))
                .totalPartsCost(new BigDecimal("145.00"))
                .totalCost(new BigDecimal("525.00"))
                .adminId(1L)
                .build();
        wo3 = workOrderRepository.save(wo3);

        auditLogRepository.save(AuditLog.builder()
                .workOrder(wo3)
                .performedBy(techUser2)
                .action("RESOLVED")
                .fromStatus(WorkOrderStatus.ON_SITE)
                .toStatus(WorkOrderStatus.COMPLETED)
                .notes("Work finished. Signed off by warehouse operations director.")
                .timestamp(now.minus(19, ChronoUnit.HOURS))
                .build());

        // Work Order 4: OPEN
        WorkOrder wo4 = WorkOrder.builder()
                .workOrderNumber("WO-2026-00103")
                .title("Excessive Vibration on Cleanroom AHU-4 Blower")
                .description("Vibration monitor warning on Rooftop Unit AHU-4. Unbalanced impeller or worn drive belt suspected in Biotech Zone C.")
                .priority(Priority.MEDIUM)
                .status(WorkOrderStatus.OPEN)
                .facility(horizonPavilion)
                .asset(hvacRooftop)
                .customer(clientApex)
                .responseSlaDue(now.plus(7, ChronoUnit.HOURS))
                .resolutionSlaDue(now.plus(47, ChronoUnit.HOURS))
                .adminId(1L)
                .build();
        workOrderRepository.save(wo4);

        auditLogRepository.save(AuditLog.builder()
                .workOrder(wo4)
                .performedBy(clientApex)
                .action("CREATED")
                .toStatus(WorkOrderStatus.OPEN)
                .notes("Submitted via Customer Self-Service Portal")
                .timestamp(now.minus(15, ChronoUnit.MINUTES))
                .build());

        log.info("Project KEYSTONE demo dataset initialized successfully with 5 users, 3 facilities, 4 assets, 5 parts, and 4 work orders.");
    }
}
