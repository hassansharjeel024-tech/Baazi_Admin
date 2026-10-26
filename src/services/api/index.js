// Side-effect imports so injectEndpoints register on the shared baseApi
import "./authApi";
import "./gameApi";
import "./categoryApi";
import "./rewardApi";
import "./rewardCategoryApi";
import "./userRewardApi";
import "./coinPackageApi";
import "./paymentApi";

export { baseApi } from "./baseApi";
