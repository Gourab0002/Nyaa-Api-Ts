export class Constants {
  static NyaaBaseUrl: string = "https://nyaa.si";
  static NyaaAltUrl: string = "https://nyaa.land";
  static UserAgent: string =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";
  static FetchTimeoutMs: number = 15000;
  static MaxPage: number = 1000;
  static DefaultProfilePicPath: string = "/static/img/avatar/default.png";

  static NyaaEndpoints: Record<string, Record<string, string>> = {
    all: {
      all: "0_0",
    },
    anime: {
      all: "1_0",
      amv: "1_1",
      eng: "1_2",
      "non-eng": "1_3",
      raw: "1_4",
    },
    audio: {
      all: "2_0",
      lossless: "2_1",
      lossy: "2_2",
    },
    manga: {
      all: "3_0",
      eng: "3_1",
      "non-eng": "3_2",
      raw: "3_3",
    },
    live_action: {
      all: "4_0",
      eng: "4_1",
      promo: "4_2",
      "non-eng": "4_3",
      raw: "4_4",
    },
    pictures: {
      all: "5_0",
      graphics: "5_1",
      photos: "5_2",
    },
    software: {
      all: "6_0",
      application: "6_1",
      applications: "6_1",
      games: "6_2",
    },
  };

  static ValidSorts: Set<string> = new Set([
    "",
    "id",
    "size",
    "seeders",
    "leechers",
    "downloads",
    "comments",
  ]);

  static ValidOrders: Set<string> = new Set(["", "asc", "desc"]);
}
