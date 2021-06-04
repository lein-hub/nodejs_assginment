document.getElementById('edit-form').addEventListener('submit', async e => {
  e.preventDefault();

  try {
    const postId = e.target.postId.value;

    const res = await axios.get('/write', { headers: { postid: postId } });
    document.write(res.data);
  } catch (err) {
    console.error(err);
  }
});

// document.getElementById('delete-form').addEventListener('submit', async e => {
//   e.preventDefault();
//   if (confirm('정말 삭제 하시겠습니까?')) {
//     try {
//       const postId = e.target.postId.value;

//       const res = await axios.post('/post/delete', {
//         headers: { postid: postId },
//       });
//       document.write(res.data);
//     } catch (err) {
//       console.error(err);
//     }
//   }
// });
