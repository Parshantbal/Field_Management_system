package com.keystone;

import com.keystone.controller.CustomerPortalController;
import com.keystone.dto.WorkOrderDTO;
import com.keystone.model.Facility;
import com.keystone.model.Priority;
import com.keystone.model.User;
import com.keystone.repository.FacilityRepository;
import com.keystone.repository.UserRepository;
import com.keystone.repository.WorkOrderRepository;
import com.keystone.security.UserPrincipal;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.ResponseEntity;

import static org.assertj.core.api.Assertions.assertThat;

import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class KeystoneApplicationTests {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WorkOrderRepository workOrderRepository;

    @Autowired
    private FacilityRepository facilityRepository;

    @Autowired
    private CustomerPortalController customerPortalController;

    @Autowired
    private MockMvc mockMvc;

    @Test
    void contextLoads() {
        assertThat(userRepository).isNotNull();
        assertThat(workOrderRepository).isNotNull();
        assertThat(userRepository.count()).isGreaterThanOrEqualTo(5);
        assertThat(workOrderRepository.count()).isGreaterThanOrEqualTo(4);
    }

    @Test
    void testSubmitServiceRequest() {
        User user = userRepository.findByEmail("client.apex@keystone.io").orElseThrow();
        UserPrincipal principal = UserPrincipal.create(user);
        Facility facility = facilityRepository.findAll().get(0);

        WorkOrderDTO.CreateWorkOrderRequest req = new WorkOrderDTO.CreateWorkOrderRequest();
        req.setTitle("Test Portal Service Request");
        req.setDescription("Water leak reported near main reception desk");
        req.setPriority(Priority.HIGH);
        req.setFacilityId(facility.getId());
        req.setAssetId(null);

        ResponseEntity<WorkOrderDTO.WorkOrderResponseDTO> res = customerPortalController.submitServiceRequest(req, principal);
        assertThat(res.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(res.getBody()).isNotNull();
        assertThat(res.getBody().getWorkOrderNumber()).startsWith("WO-2026-");
    }

    @Autowired
    private com.keystone.security.JwtTokenProvider jwtTokenProvider;

    @Test
    void testSubmitServiceRequestViaHttp() throws Exception {
        User user = userRepository.findByEmail("client.apex@keystone.io").orElseThrow();
        UserPrincipal principal = UserPrincipal.create(user);
        org.springframework.security.authentication.UsernamePasswordAuthenticationToken auth =
                new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
        String token = jwtTokenProvider.generateToken(auth);

        String json = """
                {
                    "title": "Http Test Request",
                    "description": "HVAC failure",
                    "priority": "HIGH",
                    "facilityId": 1
                }
                """;

        mockMvc.perform(post("/api/portal/requests")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andDo(print())
                .andExpect(status().isOk());
    }
}

