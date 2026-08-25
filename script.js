(function(){
  var selectedStars = 0;
  var picker = document.getElementById('starPicker');
  var stars = picker.querySelectorAll('span');
  var form = document.getElementById('reviewForm');
  var submitBtn = document.getElementById('submitBtn');
  var formMsg = document.getElementById('formMsg');
  var reviewsList = document.getElementById('reviewsList');
  var avgNumber = document.getElementById('avgNumber');
  var avgStars = document.getElementById('avgStars');
  var avgCount = document.getElementById('avgCount');
  var STORAGE_KEY = 'albertotaxi-reviews';

  function paintStars(hoverValue){
    var v = hoverValue || selectedStars;
    stars.forEach(function(s){
      var val = parseInt(s.getAttribute('data-value'), 10);
      s.classList.toggle('filled', val <= v);
    });
  }

  stars.forEach(function(s){
    s.addEventListener('mouseenter', function(){
      paintStars(parseInt(s.getAttribute('data-value'), 10));
    });
    s.addEventListener('click', function(){
      selectedStars = parseInt(s.getAttribute('data-value'), 10);
      paintStars();
    });
  });
  picker.addEventListener('mouseleave', function(){ paintStars(); });

  function starString(n){
    n = Math.round(n);
    return '★★★★★☆☆☆☆☆'.slice(5 - n, 10 - n);
  }

  function renderReviews(reviews){
    if(!reviews.length){
      reviewsList.innerHTML = '<div class="empty-state">Todavía no hay reseñas. ¡Sé el primero en dejar una!</div>';
      avgNumber.textContent = '–';
      avgStars.textContent = '☆☆☆☆☆';
      avgCount.textContent = 'Sin reseñas todavía';
      return;
    }
    var sum = 0;
    var html = '';
    reviews.slice().reverse().forEach(function(r){
      sum += r.stars;
      html += '<div class="review">' +
        '<div class="review-top">' +
          '<span class="review-name">' + escapeHtml(r.name) + '</span>' +
          '<span class="review-stars">' + starString(r.stars) + '</span>' +
        '</div>' +
        (r.comment ? '<div class="review-text">' + escapeHtml(r.comment) + '</div>' : '') +
      '</div>';
    });
    reviewsList.innerHTML = html;
    var avg = sum / reviews.length;
    avgNumber.textContent = avg.toFixed(1);
    avgStars.textContent = starString(avg);
    avgCount.textContent = reviews.length + (reviews.length === 1 ? ' reseña' : ' reseñas');
  }

  function escapeHtml(str){
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function loadReviews(){
    try{
      var raw = localStorage.getItem(STORAGE_KEY);
      var reviews = raw ? JSON.parse(raw) : [];
      renderReviews(reviews);
      return reviews;
    }catch(err){
      renderReviews([]);
      return [];
    }
  }

  function saveReviews(reviews){
    try{
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
      return true;
    }catch(err){
      return false;
    }
  }

  form.addEventListener('submit', function(e){
    e.preventDefault();
    var name = document.getElementById('nameInput').value.trim();
    var comment = document.getElementById('commentInput').value.trim();

    if(!name){
      formMsg.textContent = 'Por favor, escribe tu nombre.';
      return;
    }
    if(selectedStars < 1){
      formMsg.textContent = 'Por favor, elige una puntuación de 1 a 5 estrellas.';
      return;
    }

    submitBtn.disabled = true;
    formMsg.textContent = 'Enviando…';

    var reviews = loadReviews();
    reviews.push({ name: name, stars: selectedStars, comment: comment, date: Date.now() });
    var ok = saveReviews(reviews);

    if(ok){
      renderReviews(reviews);
      form.reset();
      selectedStars = 0;
      paintStars();
      formMsg.textContent = '¡Gracias por tu reseña!';
    }else{
      formMsg.textContent = 'No se pudo guardar la reseña. Inténtalo de nuevo.';
    }
    submitBtn.disabled = false;
    setTimeout(function(){ formMsg.textContent = ''; }, 4000);
  });

  loadReviews();
})();
