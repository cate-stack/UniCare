package com.unicare.dispensary.message;
import jakarta.persistence.*;import java.time.LocalDateTime;
@Embeddable public class MessageReply{@Column(nullable=false,length=120)private String author;@Column(nullable=false,length=2000)private String body;@Column(nullable=false)private LocalDateTime createdAt;protected MessageReply(){}public MessageReply(String author,String body){this.author=author;this.body=body;this.createdAt=LocalDateTime.now();}public String getAuthor(){return author;}public String getBody(){return body;}public LocalDateTime getCreatedAt(){return createdAt;}}
