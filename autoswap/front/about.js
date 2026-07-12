
const { icons, Header, Footer } = window.AutoSwap;

function AboutPage() {
  return `
    ${Header({ active: 'about' })}
    <main class="about-main">
      <section class="about-hero" aria-labelledby="about-title">
        <div class="container">
          <h1 id="about-title">გაცვალე მანქანა გაყიდვის გარეშე</h1>
          <p>AutoSwap აკავშირებს მფლობელებს, რომლებსაც ერთმანეთის მანქანები უნდათ — გაყიდვის ლოდინის, შემთხვევითი ზარებისა და ორმაგი ვაჭრობის გარეშე.</p>
        </div>
      </section>

      <section class="about-body container">
        <div class="about-block">
          <h2>რატომ გაცვლა?</h2>
          <p>გაყიდვა და ყიდვა ორი ცალკე პროცესია — ორი ვაჭრობა, ორი რისკი და შუაში მანქანის გარეშე დარჩენილი კვირები. გაცვლა ამ ორ ნაბიჯს ერთში აერთიანებს: თავიდანვე ხედავ, ვის უნდა შენი მანქანა, რას გთავაზობს სანაცვლოდ და რა თანხის სხვაობაზეა საუბარი.</p>
        </div>

        <div class="about-block">
          <h2>როგორ მუშაობს</h2>
          <p>დაამატებ მანქანას, მიუთითებ რა გინდა სანაცვლოდ და რა სხვაობას ელოდები. მატჩი გაჩვენებს მფლობელებს, რომლებიც სწორედ შენს მანქანას ეძებენ — პირობები ბარათზევე ჩანს, ამიტომ ზარი მხოლოდ საქმეზეა.</p>
        </div>

        <div class="about-block">
          <h2>ნდობა</h2>
          <p>მფლობელები ნომრით დასტურდებიან, პირობები კი გამჭვირვალეა: რას ეძებს მეორე მხარე და რა სხვაობას ითხოვს ან გთავაზობს, წინასწარ იცი. შეთავაზება სტრუქტურირებულია და არა შემთხვევითი მიმოწერა.</p>
        </div>

        <div class="about-block" id="contact">
          <h2>კონტაქტი</h2>
          <p>კითხვა ან უკუკავშირი გაქვს? მოგვწერე: <a class="about-mail" href="mailto:hello@autoswap.ge">hello@autoswap.ge</a></p>
        </div>
      </section>

      <section class="closing-strip">
        <div class="container closing-strip-inner">
          <p>შენი მანქანა შეიძლება უკვე ვიღაცას უნდა — განცხადება ორ წუთში ემატება.</p>
          <a class="btn btn-accent" href="sell.html">${icons.plus}<span>დაამატე მანქანა</span></a>
        </div>
      </section>
    </main>
    ${Footer()}
  `;
}

document.querySelector('#app').innerHTML = AboutPage();
