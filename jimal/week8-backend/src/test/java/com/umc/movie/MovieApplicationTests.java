package com.umc.movie;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("demo")
class MovieApplicationTests {
 @Autowired MockMvc mvc;
 @Test void availabilityAndValidation() throws Exception {
  mvc.perform(get("/members/nickname/영화팬")).andExpect(status().isOk()).andExpect(jsonPath("$.available").value(false));
  mvc.perform(get("/members/nickname/새닉네임")).andExpect(jsonPath("$.available").value(true));
  mvc.perform(get("/members/nickname/a")).andExpect(status().isBadRequest());
  mvc.perform(get("/members/nickname/abcdefghijklm")).andExpect(status().isBadRequest());
  mvc.perform(get("/members/email/movie@example.com")).andExpect(jsonPath("$.available").value(false));
  mvc.perform(get("/members/email/new@example.com")).andExpect(jsonPath("$.available").value(true));
  mvc.perform(get("/members/email/invalid")).andExpect(status().isBadRequest());
 }
 @Test void pagination() throws Exception {
  mvc.perform(get("/members/1/ratings?page=0&size=10")).andExpect(status().isOk()).andExpect(jsonPath("$.content.length()").value(10)).andExpect(jsonPath("$.totalElements").value(12)).andExpect(jsonPath("$.last").value(false));
  mvc.perform(get("/members/1/ratings?page=1&size=10")).andExpect(jsonPath("$.content.length()").value(2)).andExpect(jsonPath("$.last").value(true));
  mvc.perform(get("/members/1/ratings?page=-1")).andExpect(status().isBadRequest());
  mvc.perform(get("/members/1/ratings?size=101")).andExpect(status().isBadRequest());
  mvc.perform(get("/members/999/ratings")).andExpect(status().isNotFound());
 }
 @Test
 @org.springframework.transaction.annotation.Transactional
 void signUp() throws Exception {
  String body = "{\"email\":\"signup@example.com\",\"password\":\"MoviePass1!\",\"nickname\":\"가입테스트\"}";
  mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post("/members")
    .contentType(org.springframework.http.MediaType.APPLICATION_JSON).content(body))
    .andExpect(status().isCreated())
    .andExpect(jsonPath("$.code").value("COMMON201"))
    .andExpect(jsonPath("$.result.memberId").isNumber())
    .andExpect(jsonPath("$.result.email").value("signup@example.com"))
    .andExpect(jsonPath("$.result.password").doesNotExist());
  mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post("/members")
    .contentType(org.springframework.http.MediaType.APPLICATION_JSON).content(body))
    .andExpect(status().isConflict());
 }
 @Test void cors() throws Exception {
  mvc.perform(get("/members/nickname/영화팬").header("Origin","http://localhost:5173")).andExpect(status().isOk()).andExpect(header().string("Access-Control-Allow-Origin","http://localhost:5173"));
  mvc.perform(get("/members/nickname/영화팬").header("Origin","http://localhost:5174")).andExpect(status().isForbidden()).andExpect(header().doesNotExist("Access-Control-Allow-Origin"));
 }
}
