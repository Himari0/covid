(async () => {
    const {CovidScrapper, Utils} = require("@takiyo/covid-scrapper");
    const Pie = require("cli-pie");
    const Diagram = require("cli-diagram");
    const Loading = require("loading-cli");

    const perintah = process.argv[2];
    let negara = process.argv.splice(3).join(" ").trim() ?? "all";

    if (!perintah) return console.log("Perintah yang tersedia adalah statistik [negara] dan rs <wilayah>. Bagian yang didalam [] berarti tidak harus, dan <> adalah harus")

    switch (perintah) {
        case 'statistik': {
            const l = Loading("Mencari data... Mohon tunggu").start();
            const hasil = await CovidScrapper.getHistoricalData(negara.length ? negara : 'all', '14').catch(e => e.toString());
            l.stop();

            if (typeof hasil === "string") return console.log(hasil);
            if (!hasil.historical || !hasil.statistical) return console.log("Maaf, ada kesalahan dalam mencari data.");

            const {historical, statistical} = hasil;

            const kasus1Minggu = Utils.parseCase(Utils.weekCase(historical, 7).cases)
            const kasus2Minggu = Utils.parseCase(Utils.weekCase(historical, 14).cases)

            negara = negara === 'all' ? 'semua negara' : negara;

            console.log(`kasus di negara ${negara} dalam waktu 1 minggu`);
            const p = new Pie(7, kasus1Minggu, {legend: true});
            console.log(p.toString());

            console.log(`Kasus di negara ${negara} dalam waktu 2 minggu`);
            const p2 = new Pie(7, kasus2Minggu, {legend: true});
            console.log(p2.toString());

            const statistikCovid = [
                `Status Covid-19 di ${negara}`,
                `Terakhir diupdate pada ${new Date(statistical.updated).toLocaleString()}`,
                ``,
                `Kasus: ${statistical.cases.toLocaleString()} orang (+${statistical.todayCases.toLocaleString()} kasus hari ini)`,
                `Kematian: ${statistical.deaths.toLocaleString()} orang (+${statistical.todayDeaths.toLocaleString()} kematian hari ini)`,
                `Sembuh: ${statistical.recovered.toLocaleString()} orang (+${statistical.todayRecovered.toLocaleString()} sembuh hari ini)`,
                `Kritis: ${statistical.critical.toLocaleString()} orang`
            ];

            const statistikNegara = [
                `Statistik ${negara}`,
                ``,
                ``,
                `Yang sudah divaksin: ${statistical.tests.toLocaleString()}`,
                `Populasi: ${statistical.population.toLocaleString()}`,
                `1 kasus per orang: ${statistical.oneCasePerPeople.toLocaleString()}`,
                `1 kematian per orang: ${statistical.oneDeathPerPeople.toLocaleString()}`,
                `1 vaksin per orang: ${statistical.oneTestPerPeople.toLocaleString()}`,
            ];

            const diagram = new Diagram()
                .box(statistikCovid.join("\n"))
                .arrow(['-->'])
                .box(statistikNegara.join("\n"))

            console.log(diagram.draw());
            break;
        }

        case "rs": {
            const l = Loading(`Mencari rumah sakit di ${negara}`).start();
            const hasil = await CovidScrapper.getHospital({location: negara, limit: 20});
            l.stop();
            if (!hasil || !hasil.length) return console.log("Maaf, Rumah sakit di daerah ${negara} tidak ditemukan");

            const kataKata = [
                `Rumah Sakit di ${negara}`,
                `Menampilkan ${hasil.length} rumah sakit teratas`,
                ``,
                ...(Utils.parseHospital(hasil))
            ];

            const diagram = new Diagram()
                .box(kataKata.join('\n'))
            console.log(diagram.draw());
            break;
        }
    }
})().catch(console.log);