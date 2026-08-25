(function(){
  var SUPABASE_URL = 'https://peqjthqwaszcotkmjvqa.supabase.co';
  var SUPABASE_KEY = 'sb_publishable_Sak5jgwwbEYxAizmvbFbSw_qVuji5eY';

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

  var supabaseClient = null;

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

  picker.addEventListener('mouseleave', function(){
    paintStars();
  });

  function starString(n){
    n = Math.round(n);
    return '★★★★★☆☆☆☆☆'.slice(5 - n, 10 - n);
  }

  function escapeHtml(str){
    var div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }

  function renderReviews(reviews){
    if(!reviews.length){
      reviewsList.innerHTML =
        '<div class="empty-state">Todavía no hay reseñas. ¡Sé el primero en dejar una!</div>';

      avgNumber.textContent = '–';
      avgStars.textContent = '☆☆☆☆☆';
      avgCount.textContent = 'Sin reseñas todavía';
      return;
    }

    var sum = 0;
    var html = '';

    reviews.forEach(function(r){
      sum += Number(r.rating);

      html += '<div class="review">' +
        '<div class="review-top">' +
          '<span class="review-name">' + escapeHtml(r.name) + '</span>' +
          '<span class="review-stars">' + starString(Number(r.rating)) + '</span>' +
        '</div>' +
        (r.comment
          ? '<div class="review-text">' + escapeHtml(r.comment) + '</div>'
          : '') +
      '</div>';
    });

    reviewsList.innerHTML = html;

    var avg = sum / reviews.length;

    avgNumber.textContent = avg.toFixed(1);
    avgStars.textContent = starString(avg);
    avgCount.textContent =
      reviews.length + (reviews.length === 1 ? ' reseña' : ' reseñas');
  }

  async function loadReviews(){
    try{
      var result = await supabaseClient
        .from('reviews')
        .select('name, rating, comment, created_at')
        .eq('approved', true)
        .order('created_at', { ascending: false });

      if(result.error){
        console.error(result.error);
        renderReviews([]);
        return;
      }

      renderReviews(result.data || []);

    }catch(err){
      console.error(err);
      renderReviews([]);
    }
  }

  form.addEventListener('submit', async function(e){
    e.preventDefault();

    var name = document.getElementById('nameInput').value.trim();
    var comment = document.getElementById('commentInput').value.trim();

    if(!name){
      formMsg.textContent = 'Por favor, escribe tu nombre.';
      return;
    }

    if(selectedStars < 1){
      formMsg.textContent =
        'Por favor, elige una puntuación de 1 a 5 estrellas.';
      return;
    }

    submitBtn.disabled = true;
    formMsg.textContent = 'Enviando…';

    try{
      var result = await supabaseClient
        .from('reviews')
        .insert({
          name: name,
          rating: selectedStars,
          comment: comment,
          approved: false
        });

      if(result.error){
        console.error(result.error);
        formMsg.textContent =
          'No se pudo enviar la reseña. Inténtalo de nuevo.';
      }else{
        form.reset();
        selectedStars = 0;
        paintStars();

        formMsg.textContent =
          '¡Gracias! Tu reseña ha sido enviada y está pendiente de aprobación.';
      }

    }catch(err){
      console.error(err);
      formMsg.textContent =
        'No se pudo enviar la reseña. Inténtalo de nuevo.';
    }

    submitBtn.disabled = false;

    setTimeout(function(){
      formMsg.textContent = '';
    }, 5000);
  });

  async function start(){
    var script = document.createElement('script');

    script.src =
      'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';

    script.onload = async function(){
      supabaseClient = window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
      );

      await loadReviews();
    };

    script.onerror = function(){
      formMsg.textContent =
        'No se pudo conectar con el sistema de reseñas.';
    };

    document.head.appendChild(script);
  }

  paintStars();
  start();
})();
