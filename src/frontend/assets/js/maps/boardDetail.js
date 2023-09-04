import { CURRENT_PINS, PIN_DETAIL } from "./data.js";
import { pinDetail } from "./pinDetail.js";
let selectedPk;

function formatDate(dateString) {
  var date = new Date(dateString);
  var year = date.getFullYear();
  var month = ("0" + (date.getMonth() + 1)).slice(-2);
  var day = ("0" + date.getDate()).slice(-2);
  var hour = ("0" + date.getHours()).slice(-2);
  var minute = ("0" + date.getMinutes()).slice(-2);

  return year + "-" + month + "-" + day + " " + hour + ":" + minute;
}

document.addEventListener("DOMContentLoaded", function () {
  var buttons = document.querySelectorAll(".button-like");

  buttons.forEach(function (button) {
    button.addEventListener("click", function (event) {
      if (button.classList.contains("liked")) {
        button.classList.remove("liked");
      } else {
        button.classList.add("liked");
      }
    });
  });
});

export async function boardDetail() {
  // 유저 정보 저장할 전역 변수
  let loggedInUserEmail;

  // 좋아요 버튼
  const likeButton = document.querySelector(".button-like");

  // 좋아요 테이블 pk
  let boardLikePk;

  selectedPk = window.localStorage.getItem("selectedPk");
  console.log(selectedPk);

  // 유저 정보 가져오기 위한 통신
  await fetch("http://3.34.148.72:8000/user/me/", {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      // 로그인된 유저 이메일 저장
      loggedInUserEmail = data.results.User.email;

      // 유저 이름 설정
      const nameInput = document.querySelector(".user-email");
      nameInput.textContent = data.results.User.email;

      // 프로필 이미지 설정
      const profileImg = document.querySelector(".img-profile");
      profileImg.src = data.results.User.profile_img;
    })
    .catch((error) => console.error("Error:", error));

  // 보드 상세 정보 가져오기 위한 통신
  await fetch(`http://3.34.148.72:8000/board/${selectedPk}/`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      CURRENT_PINS.value = "";
      CURRENT_PINS.value = data.pins;

      // 공개 / 비공개 보드 표시
      const lockIcon = document.querySelector(".fa-lock");

      if (data.board.is_public) {
        lockIcon.style.display = "none"; // 숨길 때
      } else {
        lockIcon.style.display = "inline"; // 보여줄 때
      }

      // 보드 수정 / 삭제 아이콘 표시
      // 로그인된 유저와 보드 작성자가 같은 경우
      const settingsBox = document.querySelector(".settings-box");
      const boardUserEmail = data.board.user.email;

      if (loggedInUserEmail === boardUserEmail) {
        settingsBox.style.display = "block";
      } else {
        settingsBox.style.display = "none";
      }

      // 보드 이름
      const boardTitleElement = document.querySelector(".board-title");
      boardTitleElement.textContent = data.board.title;

      // 보드 작성자
      const boardUserElement = document.querySelector(".board-userId");
      boardUserElement.textContent = data.board.user.email;

      // 보드 작성일
      const boardCreatedAtElement = document.querySelector(".board-createdAt");
      boardCreatedAtElement.textContent = formatDate(data.board.created_at);

      // 보드 좋아요 개수
      const boardLikedCntElement = document.querySelector(".board-likedCnt");
      boardLikedCntElement.textContent = data.likes_count;

      // 로그인된 사용자의 보드 좋아요 여부
      if (data.user_liked[0]) {
        likeButton.classList.add("liked");

        // 좋아요 테이블 pk 저장
        boardLikePk = data.user_liked[1];
      } else {
        likeButton.classList.remove("liked");
        likeButton.classList.add("button-like");
      }

      // 보드 태그
      const ulElement = document.createElement("ul");

      data.board.tags.forEach((tag) => {
        const liElement = document.createElement("li");

        const aElement = document.createElement("a");
        aElement.href = "#";
        aElement.textContent = `${tag}`;

        // aElement.appendChild(iElement);  <i> 요소를 <a> 요소의 자식으로 추가
        liElement.appendChild(aElement); // <a> 요소를 <li> 요소의 자식으로 추가
        ulElement.appendChild(liElement); // <li> 요소를 <ul>요 소의 자식으로 추가
      });

      // 최종적으로 생성된 HTML 코드 출력
      const boardTagsElement = document.querySelector(".board-tags");
      boardTagsElement.appendChild(ulElement);

      // 핀 목록
      const containerElement = document.querySelector(".pins-container");

      data.pins.forEach((pin, index) => {
        const postElement = document.createElement("div");
        postElement.classList.add("port-post", "clearfix", "bg-white");

        if (index === 0) {
          postElement.classList.add("mt-20");
        } else {
          postElement.classList.add("mt-40", "mb-20");
        }

        const boxElement = document.createElement("div");
        boxElement.classList.add("pins-box");

        const photoDivElement = document.createElement("div");
        photoDivElement.classList.add("port-post-photo");

        const imgElement = document.createElement("img");
        imgElement.src = pin.thumbnail_img;
        imgElement.classList.add("pin-thumbnail-img");

        photoDivElement.appendChild(imgElement);

        const infoDivElement = document.createElement("div");
        infoDivElement.classList.add("port-post-info");

        const h3Element = document.createElement("h3");
        h3Element.classList.add("theme-color");
        h3Element.innerHTML = `<span>상호명: </span>${pin.title}`;

        infoDivElement.appendChild(h3Element);

        let pinsInfoDiv = document.createElement("div");
        pinsInfoDiv.classList.add("pins-info");

        ["category", "new_address"].forEach((key) => {
          if (pin[key]) {
            let h5Element = document.createElement("h5");
            let label = "";

            if (key === "category") {
              label = "카테고리";
            } else if (key === "new_address") {
              label = "주소";
            }

            h5Element.innerHTML = `<span>${label}: </span>${pin[key]}`;
            pinsInfoDiv.append(h5Element);
          }
        });

        infoDivElement.append(pinsInfoDiv);

        boxElement.append(photoDivElement, infoDivElement);

        postElement.append(boxElement);

        postElement.addEventListener("click", function () {
          $("#myModal").modal("show");
          let place_id = pin.place_id;
          console.log(place_id);
          PIN_DETAIL.placeId = place_id;
          pinDetail();
        });

        containerElement.appendChild(postElement);
      });

      // 댓글 목록
      var commentsSection = document.querySelector(".comments-container");

      data.comments.forEach(function (comment) {
        var commentDiv = document.createElement("div");
        commentDiv.className = "comments-1";

        var photoDiv = document.createElement("div");
        photoDiv.className = "comments-photo";

        var imgTag = document.createElement("img");
        imgTag.className = "img-fluid";

        if (
          comment.user.profile_img !== null &&
          comment.user.profile_img !== undefined
        ) {
          imgTag.src = comment.user.profile_img; // 실제 이미지 URL
        } else {
          imgTag.src =
            "https://everyplacetest.s3.ap-northeast-2.amazonaws.com/dev/user_default.png"; // 기본 이미지 URL
        }

        photoDiv.appendChild(imgTag);

        var infoDiv = document.createElement("div");
        infoDiv.className = "comments-info";

        let h4Tag = document.createElement("h5");
        h4Tag.className = "theme-color mb-20";

        let textNode = document.createTextNode(comment.user.email);
        let spanTag = document.createElement("span");

        let dateNode = document.createTextNode(formatDate(comment.created_at));

        spanTag.appendChild(dateNode);

        h4Tag.appendChild(textNode);
        h4Tag.appendChild(spanTag);

        let pElement = document.createElement("p");
        let pTextNode = document.createTextNode(comment.content);

        pElement.appendChild(pTextNode);

        infoDiv.appendChild(h4Tag);
        infoDiv.appendChild(pElement);

        commentDiv.appendChild(photoDiv);
        commentDiv.appendChild(infoDiv);

        commentsSection.append(commentDiv);

        // 댓글 삭제 아이콘 표시
        // 로그인된 유저와 댓글 작성자가 같은 경우
        if (comment.user.email === loggedInUserEmail) {
          const deleteIconDiv = document.createElement("div");
          deleteIconDiv.classList.add("fa", "fa-times");
          infoDiv.appendChild(deleteIconDiv);

          // 댓글 삭제 기능
          // 클릭 이벤트 추가
          deleteIconDiv.addEventListener("click", function () {
            fetch(`http://3.34.148.72:8000/board/comment/${comment.id}`, {
              method: "DELETE",
              credentials: "include",
              headers: {
                "Content-Type": "application/json",
              },
            })
              .then((response) => {
                if (response.status === 204) {
                  location.reload(); // 페이지 새로고침
                } else {
                  return response.json();
                }
              })
              .then()
              .catch((error) => console.error("Error:", error));
          });
        }
      });
    })
    .then(() => {
      // 좋아요 등록과 해제 기능
      likeButton.addEventListener("click", function () {
        if (boardLikePk) {
          // 좋아요 해제
          fetch(`http://3.34.148.72:8000/board/like/${boardLikePk}/`, {
            method: "DELETE",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          })
            .then((response) => {
              if (!response.ok) {
                throw new Error("Network response was not ok");
              }

              if (response.status === 204) {
                return;
              }

              return response.json();
            })
            .then((data) => {
              likeButton.classList.remove("liked");
              boardLikePk = null; // 좋아요 아이디 초기화
              location.reload(); // 페이지 새로고침
            })
            .catch((error) => console.error("Error:", error));
        } else {
          // 아직 좋아요가 안 눌러져 있으면 등록
          fetch(`http://3.34.148.72:8000/board/${selectedPk}/like/`, {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          })
            .then((response) => response.json())
            .then((data) => {
              // 받은 데이터에서 id를 추출하여 전역변수에 저장합니다.
              boardLikePk = data.id;
              likeButton.classList.add("liked"); // 버튼 스타일 변경
              location.reload(); // 페이지 새로고침
            })
            .catch((error) => console.error("Error:", error));
        }
      });
    })
    .catch((error) => console.error("Error:", error));

  // 댓글 등록 기능
  document.getElementById("submit").addEventListener("click", function () {
    var commentText = document.getElementById("commentText").value;

    fetch(`http://3.34.148.72:8000/board/${selectedPk}/comment/`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content: commentText }),
    })
      .then((response) => response.json())
      .then((data) => {
        location.reload(); // 페이지 새로고침
      })
      .catch((error) => console.error("Error:", error));
  });

  // 보드 삭제 기능
  document
    .getElementById("deleteButton")
    .addEventListener("click", function () {
      fetch(`http://3.34.148.72:8000/board/${selectedPk}/`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          if (response.status === 204) {
            alert("보드가 삭제되었습니다.");
            window.location.href = "user_info.html";
          } else {
            return response.json();
          }
        })
        .then()
        .catch((error) => console.error("Error:", error));
    });
}
