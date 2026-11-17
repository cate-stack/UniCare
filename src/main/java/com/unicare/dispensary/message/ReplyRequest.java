package com.unicare.dispensary.message;import jakarta.validation.constraints.NotBlank;import jakarta.validation.constraints.Size;public record ReplyRequest(@NotBlank @Size(max=2000)String body){}
